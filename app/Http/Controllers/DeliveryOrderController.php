<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeliveryOrderRequest;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderLine;
use App\Models\SalesOrder;
use App\Models\SalesOrderLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryOrderController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:do-list', only: ['index', 'show']),
            new Middleware('permission:do-create', only: ['create', 'store']),
        ];
    }

    public function index(Request $request): Response
    {
        // Only despatches against a sales order can name their client; work
        // orders and stock order transfers are not ported yet.
        $orders = DeliveryOrder::query()
            ->leftJoin('sales_orders', function ($join) {
                $join->on('loading_note.salesorder', '=', 'sales_orders.id')
                    ->where('loading_note.type', '=', 'salesorder');
            })
            ->leftJoin('company_details', 'sales_orders.customer_no', '=', 'company_details.id')
            ->select([
                'loading_note.id',
                'loading_note.type',
                'loading_note.salesorder',
                'loading_note.customer_order',
                'loading_note.total_fsd_items',
                'loading_note.delivered_fsd_items',
                'loading_note.status',
                'loading_note.created_at',
                'company_details.cname as client',
            ])
            ->orderByDesc('loading_note.id')
            ->get();

        return Inertia::render('delivery-orders/index', [
            'orders' => $orders,
            'can' => [
                'edit' => $request->user()->can('do-edit'),
                'create' => $request->user()->can('do-create'),
            ],
        ]);
    }

    /**
     * A despatch is raised against a sales order, so the form starts from that
     * order's lines and what earlier despatches already sent out.
     */
    public function create(SalesOrder $salesOrder): Response
    {
        $salesOrder->load(['lines', 'client:id,cname']);

        return Inertia::render('delivery-orders/form', [
            'order' => [
                ...$salesOrder->only(['id', 'customer_order', 'contact_person']),
                'client' => $salesOrder->client?->cname,
            ],
            'lines' => $salesOrder->lines->map(fn (SalesOrderLine $line) => [
                ...$line->only(['id', 'item', 'product', 'stock_code', 'description', 'quantity', 'unit']),
                'already_sent' => $this->alreadySent($salesOrder)[$line->item] ?? 0,
            ]),
        ]);
    }

    public function store(DeliveryOrderRequest $request): RedirectResponse
    {
        $quantities = $request->despatchedQuantities();

        if ($quantities === []) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Enter a quantity against at least one line.',
            ]);

            return back();
        }

        $salesOrder = SalesOrder::with('lines')->findOrFail($request->validated('salesorder'));
        $lines = $salesOrder->lines->whereIn('id', array_keys($quantities));

        $deliveryOrder = DB::transaction(function () use ($request, $salesOrder, $lines, $quantities) {
            $deliveryOrder = DeliveryOrder::create([
                'type' => 'salesorder',
                'salesorder' => $salesOrder->id,
                'customer_order' => $request->validated('customer_order') ?? $salesOrder->customer_order,
                // Both counts are of lines, as the legacy screen records them.
                'total_fsd_items' => $salesOrder->lines->count(),
                'delivered_fsd_items' => $lines->count(),
                'status' => 'valid',
            ]);

            foreach ($lines as $line) {
                $deliveryOrder->lines()->create([
                    'item' => $line->item,
                    'poitem' => $line->polineitem,
                    'quantity' => $quantities[$line->id],
                    'actual_qty' => $quantities[$line->id],
                    'product' => $line->product,
                    'description' => $line->description,
                    'postock_code' => $line->postock_code,
                    'stockcode' => $line->stock_code,
                    'std_stockcode' => $line->std_stockcode,
                    'unit_price' => $line->unit_price,
                    'weight' => $line->weight,
                    'sst' => $line->sst ?? 0,
                ]);
            }

            return $deliveryOrder;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Delivery order created.']);

        return to_route('delivery-order.show', $deliveryOrder);
    }

    /**
     * How much of each sales order line earlier despatches already sent, by
     * item number: that is what a despatch line records, not the line id.
     *
     * @return array<int, int>
     */
    private function alreadySent(SalesOrder $salesOrder): array
    {
        return DB::table('loading_note_content')
            ->join('loading_note', 'loading_note.id', '=', 'loading_note_content.do_id')
            ->where('loading_note.type', 'salesorder')
            ->where('loading_note.salesorder', $salesOrder->id)
            ->where(fn ($query) => $query->where('loading_note.status', '!=', 'invalid')
                ->orWhereNull('loading_note.status'))
            ->groupBy('loading_note_content.item')
            ->selectRaw('loading_note_content.item as item, sum(loading_note_content.actual_qty) as sent')
            ->get()
            ->mapWithKeys(fn ($row) => [(int) $row->item => (int) $row->sent])
            ->all();
    }

    public function show(DeliveryOrder $deliveryOrder): Response
    {
        $deliveryOrder->load('lines');

        $salesOrder = $deliveryOrder->isForSalesOrder()
            ? $deliveryOrder->salesOrder()->with('client:id,cname')->first()
            : null;

        return Inertia::render('delivery-orders/show', [
            'order' => [
                ...$deliveryOrder->only([
                    'id', 'type', 'salesorder', 'customer_order',
                    'total_fsd_items', 'delivered_fsd_items', 'status', 'created_at',
                ]),
                'complete' => $deliveryOrder->isComplete(),
                'client' => $salesOrder?->client?->cname,
                'sales_order_id' => $salesOrder?->id,
                // A despatch can be listed on a packing list; show which.
                'packing_lists' => DB::table('packinglist_content')
                    ->where('do_id', $deliveryOrder->id)
                    ->distinct()
                    ->pluck('packingid'),
            ],
            'lines' => $deliveryOrder->lines->map(fn (DeliveryOrderLine $line) => [
                ...$line->only([
                    'id', 'item', 'poitem', 'product', 'stockcode', 'std_stockcode',
                    'postock_code', 'description', 'quantity', 'actual_qty',
                    'unit_price', 'weight', 'sst',
                ]),
                'line_total' => $line->lineTotal(),
            ]),
            'totals' => $deliveryOrder->totals(),
        ]);
    }
}
