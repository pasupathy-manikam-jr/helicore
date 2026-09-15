<?php

namespace App\Http\Controllers;

use App\Http\Requests\PackingListRequest;
use App\Models\DeliveryOrder;
use App\Models\PackingList;
use App\Models\PackingListLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PackingListController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:pl-list', only: ['index', 'show']),
            new Middleware('permission:pl-create', only: ['create', 'store']),
        ];
    }

    public function index(Request $request): Response
    {
        $lineCounts = DB::table('packinglist_content')
            ->groupBy('packingid')
            // `lines` is reserved in MySQL, hence the alias.
            ->selectRaw('packingid, count(*) as total')
            ->pluck('total', 'packingid');

        $lists = PackingList::query()
            ->orderByDesc('id')
            ->get()
            ->map(fn (PackingList $list) => [
                ...$list->only(['id', 'ref', 'altcustomername', 'created_at']),
                'sales_orders' => $list->salesOrderIds(),
                'line_count' => (int) ($lineCounts[$list->id] ?? 0),
            ]);

        return Inertia::render('packing-lists/index', [
            'lists' => $lists,
            'can' => [
                'edit' => $request->user()->can('pl-edit'),
                'create' => $request->user()->can('pl-create'),
            ],
        ]);
    }

    /**
     * A packing list is packed from one despatch, so the form asks for a month
     * and then a delivery order raised in it. Every line of that note is
     * packed; weights and values are filled in afterwards.
     */
    public function create(Request $request): Response
    {
        $filters = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'delivery_order' => ['nullable', 'integer', 'exists:loading_note,id'],
        ]);

        $month = $filters['month'] ?? null;

        $deliveryOrders = $month === null ? collect() : DeliveryOrder::query()
            ->whereYear('created_at', substr($month, 0, 4))
            ->whereMonth('created_at', substr($month, 5, 2))
            ->orderByDesc('id')
            ->get(['id', 'type', 'salesorder', 'customer_order']);

        $deliveryOrder = isset($filters['delivery_order'])
            ? DeliveryOrder::with('lines')->find($filters['delivery_order'])
            : null;

        $salesOrder = $deliveryOrder?->isForSalesOrder()
            ? $deliveryOrder->salesOrder()->with('client:id,cname')->first()
            : null;

        return Inertia::render('packing-lists/form', [
            'month' => $month,
            'deliveryOrders' => $deliveryOrders,
            'deliveryOrder' => $deliveryOrder === null ? null : [
                ...$deliveryOrder->only(['id', 'type', 'salesorder', 'customer_order', 'created_at']),
                'client' => $salesOrder?->client?->cname,
            ],
            'lines' => $deliveryOrder === null ? [] : $deliveryOrder->lines->map->only([
                'id', 'item', 'product', 'stockcode', 'description', 'quantity', 'actual_qty', 'weight',
            ]),
        ]);
    }

    public function store(PackingListRequest $request): RedirectResponse
    {
        $deliveryOrder = DeliveryOrder::with('lines')->findOrFail($request->validated('delivery_order'));

        if ($deliveryOrder->lines->isEmpty()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'That delivery order has no lines to pack.',
            ]);

            return back();
        }

        $salesOrder = $deliveryOrder->isForSalesOrder() ? $deliveryOrder->salesOrder : null;

        $packingList = DB::transaction(function () use ($request, $deliveryOrder, $salesOrder) {
            $packingList = PackingList::create([
                'fsdorder' => (string) $deliveryOrder->salesorder,
                'ref' => $request->validated('ref'),
                'altcustomername' => $request->validated('altcustomername')
                    ?? $salesOrder?->client?->cname,
            ]);

            foreach ($deliveryOrder->lines as $line) {
                $packingList->lines()->create([
                    'salesorder' => $deliveryOrder->salesorder,
                    'do_id' => $deliveryOrder->id,
                    'item' => $line->item,
                    'unit_weight' => $line->weight,
                ]);
            }

            return $packingList;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Packing list created.']);

        return to_route('packing-list.show', $packingList);
    }

    public function show(PackingList $packingList): Response
    {
        $packingList->load('lines');

        // Packing list rows point at a despatch and the item number within it,
        // not at a line id, so the description is looked up on that pair.
        $despatchLines = DB::table('loading_note_content')
            ->whereIn('do_id', $packingList->lines->pluck('do_id')->unique()->filter())
            ->get(['do_id', 'item', 'stockcode', 'description', 'actual_qty'])
            ->keyBy(fn ($line) => $line->do_id.':'.$line->item);

        return Inertia::render('packing-lists/show', [
            'list' => [
                ...$packingList->only(['id', 'ref', 'altcustomername', 'created_at']),
                'sales_orders' => $packingList->salesOrderIds(),
            ],
            'lines' => $packingList->lines->map(function (PackingListLine $line) use ($despatchLines) {
                $despatch = $despatchLines->get($line->do_id.':'.$line->item);

                return [
                    ...$line->only(['id', 'salesorder', 'do_id', 'item', 'unit_weight', 'unit_value', 'decuval']),
                    'stockcode' => $despatch->stockcode ?? null,
                    'description' => $despatch->description ?? null,
                    'quantity' => $despatch->actual_qty ?? null,
                ];
            }),
            'totals' => $packingList->totals(),
        ]);
    }
}
