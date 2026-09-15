<?php

namespace App\Http\Controllers;

use App\Http\Requests\SalesOrderRequest;
use App\Models\Client;
use App\Models\Currency;
use App\Models\DeliveryAddress;
use App\Models\ModeOfShipment;
use App\Models\SalesOrder;
use App\Models\SalesOrderLine;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class SalesOrderController extends Controller implements HasMiddleware
{
    /**
     * The legacy permissions table has no salesorder-show row, so viewing one
     * follows the listing permission.
     *
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:salesorder-list', only: ['index', 'show', 'confirmation']),
            new Middleware('permission:salesorder-create', only: ['create', 'store']),
            new Middleware('permission:salesorder-edit', only: ['edit', 'update']),
        ];
    }

    public function index(Request $request): Response
    {
        $orders = SalesOrder::query()
            ->leftJoin('company_details', 'sales_orders.customer_no', '=', 'company_details.id')
            ->leftJoin('users', 'sales_orders.sales_person', '=', 'users.id')
            ->select([
                'sales_orders.id',
                'sales_orders.contact_person',
                'sales_orders.customer_order',
                'sales_orders.closing_date',
                'sales_orders.invoice',
                'sales_orders.workorder',
                'sales_orders.sst',
                'sales_orders.created_at',
                'company_details.cname as client',
                'users.name as salesperson',
            ])
            ->orderByDesc('sales_orders.id')
            ->get();

        return Inertia::render('sales-orders/index', [
            'orders' => $orders,
            'can' => [
                'edit' => $request->user()->can('salesorder-edit'),
                'create' => $request->user()->can('salesorder-create'),
            ],
        ]);
    }

    /**
     * The order confirmation: the same order written as the document the
     * customer is sent, rather than the internal record.
     */
    public function confirmation(SalesOrder $salesOrder): Response
    {
        $salesOrder->load([
            'lines', 'client', 'deliveryAddress', 'currencyRef',
            'salesperson:id,name', 'processor:id,name',
        ]);

        $charged = (bool) $salesOrder->sst;

        return Inertia::render('sales-orders/confirmation', [
            'order' => [
                ...$salesOrder->only([
                    'id', 'contact_person', 'customer_order', 'receiving_note',
                    'required_datetime', 'bid_validity', 'pay_terms', 'email',
                    'sst', 'miscellaneous', 'created_at',
                ]),
                'client' => $salesOrder->client?->only([
                    'id', 'cname', 'address', 'city', 'state', 'country',
                ]),
                'delivery_address' => $salesOrder->deliveryAddress?->only([
                    'id', 'customer_name', 'address', 'city', 'state', 'country',
                ]),
                'currency' => $salesOrder->currencyRef?->name,
                'salesperson' => $salesOrder->salesperson?->name,
                'issuer' => $salesOrder->processor?->name,
            ],
            'lines' => $salesOrder->lines->map(fn (SalesOrderLine $line) => [
                ...$line->only([
                    'id', 'item', 'description', 'unit', 'quantity', 'unit_price', 'sst',
                ]),
                'line_total' => $line->lineTotal($charged),
            ]),
            'totals' => $salesOrder->totals(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('sales-orders/form', [
            'order' => null,
            ...$this->formOptions(),
        ]);
    }

    public function store(SalesOrderRequest $request): RedirectResponse
    {
        $salesOrder = SalesOrder::create($request->salesOrderAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sales order created.']);

        return to_route('sales-order.show', $salesOrder);
    }

    public function edit(SalesOrder $salesOrder): Response
    {
        return Inertia::render('sales-orders/form', [
            'order' => $salesOrder->only([
                'id', 'customer_no', 'delivery_address', 'contact_person', 'email',
                'customer_order', 'receiving_note', 'sales_person',
                'contract_reviewed_by', 'order_process_by', 'currency',
                'mode_of_shipment', 'packaging_type', 'certification', 'sst',
                'is_cod', 'customer_reqdate', 'required_datetime', 'goods_ready_date',
                'despatch_date', 'packorder_date', 'closing_date', 'quote_basis',
                'delivery', 'bid_validity', 'pay_terms', 'afe', 'freightcharge',
                'packcost', 'custom', 'miscellaneous', 'miscvalue', 'discount',
                'sp_instruct1', 'sp_instruct2', 'sp_instruct3', 'remarks',
            ]),
            ...$this->formOptions(),
        ]);
    }

    public function update(SalesOrderRequest $request, SalesOrder $salesOrder): RedirectResponse
    {
        $salesOrder->update($request->salesOrderAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sales order updated.']);

        return to_route('sales-order.show', $salesOrder);
    }

    public function show(Request $request, SalesOrder $salesOrder): Response
    {
        $salesOrder->load([
            'lines', 'client', 'deliveryAddress', 'currencyRef',
            'salesperson:id,name', 'reviewer:id,name', 'processor:id,name',
        ]);

        $charged = (bool) $salesOrder->sst;

        return Inertia::render('sales-orders/show', [
            'order' => [
                ...$salesOrder->only([
                    'id', 'contact_person', 'customer_order', 'receiving_note',
                    'customer_reqdate',
                    'required_datetime', 'goods_ready_date', 'despatch_date',
                    'closing_date', 'packorder_date', 'mode_of_shipment', 'freight',
                    'packaging_type', 'sp_instruct1', 'sp_instruct2', 'sp_instruct3',
                    'invoice', 'workorder', 'afe', 'remarks', 'certification',
                    'quote_basis', 'delivery', 'bid_validity', 'pay_terms', 'email',
                    'miscellaneous', 'sst', 'is_cod', 'created_at',
                ]),
                'client' => $salesOrder->client?->only(['id', 'cname', 'address', 'city', 'state', 'country']),
                'delivery_address' => $salesOrder->deliveryAddress?->only([
                    'id', 'customer_name', 'address', 'city', 'state', 'country',
                ]),
                'currency' => $salesOrder->currencyRef?->name,
                'salesperson' => $salesOrder->salesperson?->name,
                'reviewer' => $salesOrder->reviewer?->name,
                'processor' => $salesOrder->processor?->name,
            ],
            'lines' => $salesOrder->lines->map(fn (SalesOrderLine $line) => [
                ...$line->only([
                    'id', 'item', 'product', 'stock_code', 'std_stockcode',
                    'postock_code', 'polineitem', 'linedate', 'description',
                    'unit', 'quantity', 'weight', 'unit_price', 'sst', 'batch',
                    'type_of_certification', 'operator', 'wo', 'fgmr', 'po',
                ]),
                'line_total' => $line->lineTotal($charged),
                'line_weight' => round((float) $line->quantity * (float) $line->weight, 2),
            ]),
            'totals' => $salesOrder->totals(),
            'can' => [
                'edit' => $request->user()->can('salesorder-edit'),
                'deleteLine' => $request->user()->can('salesorder-delete'),
            ],
        ]);
    }

    /**
     * Reference data every sales order form needs.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'clients' => Client::query()->orderBy('cname')->get(['id', 'cname']),
            'deliveryAddresses' => DeliveryAddress::query()
                ->orderBy('customer_name')
                ->get(['id', 'customer_name', 'company_detail_id', 'city']),
            'currencies' => Currency::query()->orderBy('name')->get(['id', 'name']),
            'modesOfShipment' => ModeOfShipment::query()->orderBy('mode')->get(['id', 'mode']),
            'salespeople' => User::query()
                ->where('department', 'Sales')
                ->orderBy('name')
                ->get(['id', 'name']),
            'staff' => User::query()->orderBy('name')->get(['id', 'name']),
        ];
    }
}
