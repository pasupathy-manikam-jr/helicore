<?php

namespace App\Http\Controllers;

use App\Models\StockOrderTransfer;
use App\Models\StockOrderTransferLine;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class StockOrderTransferController extends Controller implements HasMiddleware
{
    /**
     * The legacy screen hangs off the work order permissions.
     *
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
        $transfers = StockOrderTransfer::query()
            ->leftJoin('company_details', 'stock_order_transfers.customer_no', '=', 'company_details.id')
            ->leftJoin('users', 'stock_order_transfers.sales_person', '=', 'users.id')
            ->select([
                'stock_order_transfers.id',
                'stock_order_transfers.salesorder',
                'stock_order_transfers.customer_order',
                'stock_order_transfers.contact_person',
                'stock_order_transfers.despatch_date',
                'stock_order_transfers.closing_date',
                'stock_order_transfers.location',
                'stock_order_transfers.created_at',
                'company_details.cname as client',
                'users.name as salesperson',
            ])
            ->orderByDesc('stock_order_transfers.id')
            ->get();

        return Inertia::render('stock-transfers/index', [
            'transfers' => $transfers,
            'can' => ['edit' => $request->user()->can('stockorder-edit')],
        ]);
    }

    public function show(StockOrderTransfer $stockTransfer): Response
    {
        $stockTransfer->load(['lines', 'client:id,cname', 'currencyRef:id,name']);

        return Inertia::render('stock-transfers/show', [
            'transfer' => [
                ...$stockTransfer->only([
                    'id', 'salesorder', 'customer_order', 'contact_person',
                    'goods_ready_date', 'customer_reqdate', 'despatch_date',
                    'closing_date', 'mode_of_shipment', 'packaging_type',
                    'location', 'remarks', 'email', 'afe', 'miscellaneous',
                    'sp_instruct1', 'sp_instruct2', 'sp_instruct3', 'created_at',
                ]),
                'client' => $stockTransfer->client?->cname,
                'currency' => $stockTransfer->currencyRef?->name,
            ],
            'lines' => $stockTransfer->lines->map(fn (StockOrderTransferLine $line) => [
                ...$line->only([
                    'id', 'item', 'linedate', 'product', 'stock_code', 'description',
                    'unit', 'quantity', 'weight', 'unit_price', 'batch',
                    'type_of_certification', 'fgmr', 'po',
                ]),
                'line_total' => round((float) $line->quantity * (float) $line->unit_price, 2),
            ]),
            'totals' => $stockTransfer->totals(),
        ]);
    }
}
