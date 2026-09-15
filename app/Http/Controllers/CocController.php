<?php

namespace App\Http\Controllers;

use App\Http\Requests\CocRequest;
use App\Models\Coc;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class CocController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:coc-list', only: ['index', 'show']),
            new Middleware('permission:coc-create', only: ['create', 'store']),
        ];
    }

    public function index(Request $request): Response
    {
        $cocs = Coc::query()
            ->with(['client:id,cname'])
            ->orderByDesc('id')
            ->get(['id', 'indexno', 'customer_no', 'fsdorder', 'quality_auth', 'remarks', 'rowno', 'created_at'])
            ->map(fn (Coc $coc) => [
                ...$coc->only(['id', 'indexno', 'fsdorder', 'quality_auth', 'remarks', 'created_at']),
                'client' => $coc->client?->cname,
                'line_count' => count($coc->lineIds()),
            ]);

        return Inertia::render('cocs/index', [
            'cocs' => $cocs,
            'can' => [
                'edit' => $request->user()->can('coc-edit'),
                'create' => $request->user()->can('coc-create'),
            ],
        ]);
    }

    /**
     * A certificate covers one despatch, so the form asks for a month, then a
     * delivery order raised in it, then which of its lines are certified.
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

        return Inertia::render('cocs/form', [
            'month' => $month,
            'deliveryOrders' => $deliveryOrders,
            'deliveryOrder' => $deliveryOrder === null ? null : [
                ...$deliveryOrder->only(['id', 'type', 'salesorder', 'customer_order', 'created_at']),
                'client' => $salesOrder?->client?->cname,
                'customer_no' => $salesOrder?->customer_no,
            ],
            // Ordered by product, as the legacy screen lists them.
            'lines' => $deliveryOrder === null ? [] : $deliveryOrder->lines
                ->sortBy('product')
                ->values()
                ->map->only([
                    'id', 'item', 'product', 'stockcode', 'description',
                    'quantity', 'actual_qty',
                ]),
        ]);
    }

    public function store(CocRequest $request): RedirectResponse
    {
        $deliveryOrder = DeliveryOrder::with('lines')->findOrFail($request->validated('delivery_order'));

        // Only lines that belong to this despatch, so a tampered form cannot
        // certify goods from another one.
        $lines = $deliveryOrder->lines
            ->whereIn('id', $request->validated('lines'))
            ->map(fn (DeliveryOrderLine $line) => $line->id);

        if ($lines->isEmpty()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Tick at least one line on this delivery order.',
            ]);

            return back();
        }

        $salesOrder = $deliveryOrder->isForSalesOrder() ? $deliveryOrder->salesOrder : null;

        $coc = Coc::create([
            'fsdorder' => $deliveryOrder->salesorder,
            'indexno' => $deliveryOrder->id,
            'customer_no' => $salesOrder?->customer_no,
            'quality_auth' => $request->validated('quality_auth'),
            'rowno' => $lines->implode(','),
            'remarks' => $request->validated('remarks'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Certificate created.']);

        return to_route('coc.show', $coc);
    }

    public function show(Coc $coc): Response
    {
        $coc->load(['client:id,cname']);

        return Inertia::render('cocs/show', [
            'coc' => [
                ...$coc->only(['id', 'indexno', 'fsdorder', 'quality_auth', 'remarks', 'created_at']),
                'client' => $coc->client?->cname,
            ],
            'lines' => $coc->lines()->map->only([
                'id', 'item', 'product', 'stockcode', 'std_stockcode',
                'description', 'quantity', 'actual_qty',
            ]),
        ]);
    }
}
