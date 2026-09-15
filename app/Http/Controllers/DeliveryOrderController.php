<?php

namespace App\Http\Controllers;

use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderLine;
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
            'can' => ['edit' => $request->user()->can('do-edit')],
        ]);
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
