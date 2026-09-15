<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Models\WorkOrderLine;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:stockorder-list', only: ['index', 'show']),
        ];
    }

    public function index(Request $request): Response
    {
        $orders = WorkOrder::query()
            ->leftJoin('company_details', 'stock_orders.customer_no', '=', 'company_details.id')
            ->leftJoin('users', 'stock_orders.order_process_by', '=', 'users.id')
            ->select([
                'stock_orders.id',
                'stock_orders.salesorder',
                'stock_orders.contact_person',
                'stock_orders.goods_ready_date',
                'stock_orders.closing_date',
                'stock_orders.location',
                'stock_orders.created_at',
                'company_details.cname as client',
                'users.name as processor',
            ])
            ->orderByDesc('stock_orders.id')
            ->get();

        return Inertia::render('work-orders/index', [
            'orders' => $orders,
            'can' => ['edit' => $request->user()->can('stockorder-edit')],
        ]);
    }

    public function show(WorkOrder $workOrder): Response
    {
        $workOrder->load(['lines', 'client:id,cname', 'processor:id,name']);

        return Inertia::render('work-orders/show', [
            'order' => [
                ...$workOrder->only([
                    'id', 'salesorder', 'contact_person', 'goods_ready_date',
                    'closing_date', 'packorder_date', 'mode_of_shipment',
                    'packaging_type', 'location', 'remarks', 'email',
                    'sp_instruct1', 'sp_instruct2', 'sp_instruct3', 'created_at',
                ]),
                'client' => $workOrder->client?->cname,
                'processor' => $workOrder->processor?->name,
            ],
            'lines' => $workOrder->lines->map(fn (WorkOrderLine $line) => [
                ...$line->only([
                    'id', 'item', 'linedate', 'product', 'stock_code', 'description',
                    'unit', 'quantity', 'weight', 'unit_price', 'batch',
                    'type_of_certification', 'operator', 'fgmr', 'po',
                ]),
                'line_total' => round((float) $line->quantity * (float) $line->unit_price, 2),
            ]),
            'totals' => $workOrder->totals(),
        ]);
    }
}
