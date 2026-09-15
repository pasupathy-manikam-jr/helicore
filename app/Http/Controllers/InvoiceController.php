<?php

namespace App\Http\Controllers;

use App\Models\DeliveryOrderLine;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            // The legacy controller names invoice-index and invoice-show, but
            // neither exists in the permissions table; invoice-list does.
            new Middleware('permission:invoice-list', only: ['index', 'show']),
        ];
    }

    public function index(Request $request): Response
    {
        $invoices = Invoice::query()
            ->leftJoin('sales_orders', 'invoice.fsdno', '=', 'sales_orders.id')
            ->leftJoin('company_details', 'sales_orders.customer_no', '=', 'company_details.id')
            ->select([
                'invoice.id',
                'invoice.acct_invoiceno',
                'invoice.fsdno',
                'invoice.indexno',
                'invoice.subtotal',
                'invoice.discount',
                'invoice.paymentterms',
                'invoice.sst',
                'invoice.created_at',
                'company_details.cname as client',
            ])
            ->orderByDesc('invoice.id')
            ->get();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'can' => ['edit' => $request->user()->can('invoice-edit')],
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['lines', 'salesOrder.client:id,cname', 'salesOrder.currencyRef:id,name']);

        return Inertia::render('invoices/show', [
            'invoice' => [
                ...$invoice->only([
                    'id', 'acct_invoiceno', 'fsdno', 'indexno', 'paymentterms',
                    'sst', 'misc_title', 'totalmyr', 'created_at',
                ]),
                'client' => $invoice->salesOrder?->client?->cname,
                'currency' => $invoice->salesOrder?->currencyRef?->name,
                'customer_order' => $invoice->salesOrder?->customer_order,
            ],
            'lines' => $invoice->lines->map(fn (DeliveryOrderLine $line) => [
                ...$line->only([
                    'id', 'item', 'product', 'stockcode', 'description',
                    'quantity', 'actual_qty', 'unit_price', 'sst',
                ]),
                // An invoice bills what went out, not what was ordered.
                'line_total' => round(
                    (float) $line->actual_qty * (float) $line->unit_price
                        + ((bool) $invoice->sst ? (float) $line->sst : 0),
                    2,
                ),
            ]),
            'totals' => $invoice->totals(),
        ]);
    }
}
