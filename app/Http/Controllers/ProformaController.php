<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProformaRequest;
use App\Models\Currency;
use App\Models\Proforma;
use App\Models\SalesOrder;
use App\Models\SalesOrderLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class ProformaController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            // The legacy controller asks for proforma-* permissions that were
            // never created, which locks the screen for everyone. Proformas
            // are the pre-invoice, so they follow the invoice permission.
            new Middleware('permission:invoice-list', only: ['index', 'show']),
            new Middleware('permission:invoice-create', only: ['create', 'store']),
        ];
    }

    public function index(Request $request): Response
    {
        $proformas = Proforma::query()
            ->leftJoin('sales_orders', 'proforma.fsdno', '=', 'sales_orders.id')
            ->leftJoin('company_details', 'sales_orders.customer_no', '=', 'company_details.id')
            ->select([
                'proforma.id',
                'proforma.fsdno',
                'proforma.subtotal',
                'proforma.totalmyr',
                'proforma.discount',
                'proforma.paymentdue',
                'proforma.sst',
                'proforma.created_at',
                'company_details.cname as client',
            ])
            ->orderByDesc('proforma.id')
            ->get();

        return Inertia::render('proformas/index', [
            'proformas' => $proformas,
            'can' => [
                'edit' => $request->user()->can('proforma-edit'),
                'create' => $request->user()->can('invoice-create'),
            ],
        ]);
    }

    /**
     * A proforma quotes a sales order before anything ships, so the form asks
     * for a month and then one of that month's orders that is still open.
     */
    public function create(Request $request): Response
    {
        $filters = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'sales_order' => ['nullable', 'integer', 'exists:sales_orders,id'],
        ]);

        $month = $filters['month'] ?? null;

        $salesOrders = $month === null ? collect() : SalesOrder::query()
            ->leftJoin('company_details', 'sales_orders.customer_no', '=', 'company_details.id')
            // Closed orders have been delivered and invoiced already.
            ->whereNull('sales_orders.closing_date')
            ->whereYear('sales_orders.created_at', substr($month, 0, 4))
            ->whereMonth('sales_orders.created_at', substr($month, 5, 2))
            ->orderByDesc('sales_orders.id')
            ->get([
                'sales_orders.id',
                'sales_orders.customer_order',
                'company_details.cname as client',
            ]);

        $salesOrder = isset($filters['sales_order'])
            ? SalesOrder::with(['lines', 'client:id,cname', 'currencyRef:id,name'])->find($filters['sales_order'])
            : null;

        $charged = (bool) $salesOrder?->sst;

        return Inertia::render('proformas/form', [
            'month' => $month,
            'salesOrders' => $salesOrders,
            'salesOrder' => $salesOrder === null ? null : [
                ...$salesOrder->only(['id', 'customer_order', 'pay_terms', 'miscellaneous', 'created_at']),
                'client' => $salesOrder->client?->cname,
                'currency' => $salesOrder->currencyRef?->name,
                'sst' => $charged,
            ],
            'lines' => $salesOrder === null ? [] : $salesOrder->lines->map(fn (SalesOrderLine $line) => [
                ...$line->only(['id', 'item', 'product', 'stock_code', 'description', 'quantity', 'unit', 'unit_price']),
                'line_total' => $line->lineTotal($charged),
            ]),
            'totals' => $salesOrder?->totals(),
        ]);
    }

    public function store(ProformaRequest $request): RedirectResponse
    {
        $salesOrder = SalesOrder::with(['lines', 'currencyRef'])->findOrFail($request->validated('sales_order'));

        if ($salesOrder->lines->isEmpty()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'That sales order has no lines to quote.',
            ]);

            return back();
        }

        $totals = $salesOrder->totals();
        $rate = (float) (Currency::query()->whereKey($salesOrder->currency)->value('myrrate') ?? 1);

        // The charges come from the sales order. The legacy screen read them
        // from attributes the table does not have, so they were saved as null.
        $proforma = Proforma::create([
            'fsdno' => $salesOrder->id,
            'indexno' => '0',
            'subtotal' => $totals['subtotal'],
            'totalmyr' => round($totals['grand_total'] * $rate, 2),
            'discount' => $totals['discount'],
            'paymentdue' => $request->validated('paymentdue') ?? $salesOrder->pay_terms,
            'transportation' => $totals['freight'],
            'custom' => $totals['customs'],
            'packing_charge' => $totals['packing'],
            'misc' => $totals['misc'],
            'misc_title' => $request->validated('misc_title') ?? $salesOrder->miscellaneous,
            'sst' => $salesOrder->sst ? 1 : 0,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proforma created.']);

        return to_route('proforma.show', $proforma);
    }

    public function show(Proforma $proforma): Response
    {
        $proforma->load(['lines', 'salesOrder.client:id,cname', 'salesOrder.currencyRef:id,name']);

        $charged = (bool) $proforma->sst;

        return Inertia::render('proformas/show', [
            'proforma' => [
                ...$proforma->only([
                    'id', 'fsdno', 'paymentdue', 'sst', 'misc_title', 'totalmyr', 'created_at',
                ]),
                'client' => $proforma->salesOrder?->client?->cname,
                'currency' => $proforma->salesOrder?->currencyRef?->name,
                'customer_order' => $proforma->salesOrder?->customer_order,
            ],
            'lines' => $proforma->lines->map(fn (SalesOrderLine $line) => [
                ...$line->only([
                    'id', 'item', 'product', 'stock_code', 'description',
                    'unit', 'quantity', 'weight', 'unit_price', 'sst',
                ]),
                'line_total' => $line->lineTotal($charged),
            ]),
            'totals' => $proforma->totals(),
        ]);
    }
}
