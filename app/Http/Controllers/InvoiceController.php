<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvoiceRequest;
use App\Models\Currency;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderLine;
use App\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
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
            new Middleware('permission:invoice-create', only: ['create', 'store']),
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
            'can' => [
                'edit' => $request->user()->can('invoice-edit'),
                'create' => $request->user()->can('invoice-create'),
            ],
        ]);
    }

    /**
     * An invoice bills one despatch, so the form asks for a month and then a
     * delivery order raised in it. What is billed comes from that note.
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
            ->get(['id', 'type', 'salesorder', 'customer_order', 'status']);

        $deliveryOrder = isset($filters['delivery_order'])
            ? DeliveryOrder::with('lines')->find($filters['delivery_order'])
            : null;

        $salesOrder = $deliveryOrder?->isForSalesOrder()
            ? $deliveryOrder->salesOrder()->with(['client:id,cname', 'currencyRef:id,name'])->first()
            : null;

        $charged = (bool) $salesOrder?->sst;

        return Inertia::render('invoices/form', [
            'month' => $month,
            'deliveryOrders' => $deliveryOrders,
            'deliveryOrder' => $deliveryOrder === null ? null : [
                ...$deliveryOrder->only(['id', 'type', 'salesorder', 'customer_order', 'status', 'created_at']),
                'client' => $salesOrder?->client?->cname,
                'currency' => $salesOrder?->currencyRef?->name,
                'pay_terms' => $salesOrder?->pay_terms,
                'sst' => $charged,
                'already_invoiced' => $deliveryOrder === null ? false : Invoice::query()
                    ->where('indexno', (string) $deliveryOrder->id)
                    ->exists(),
            ],
            'lines' => $deliveryOrder === null ? [] : $deliveryOrder->lines->map(fn (DeliveryOrderLine $line) => [
                ...$line->only(['id', 'item', 'product', 'stockcode', 'description', 'actual_qty', 'unit_price', 'sst']),
                'line_total' => round(
                    (float) $line->actual_qty * (float) $line->unit_price + ($charged ? (float) $line->sst : 0),
                    2,
                ),
            ]),
            'subtotal' => $deliveryOrder === null ? 0 : $this->subtotal($deliveryOrder, $charged),
        ]);
    }

    public function store(InvoiceRequest $request): RedirectResponse
    {
        $deliveryOrder = DeliveryOrder::with('lines')->findOrFail($request->validated('delivery_order'));

        if ($deliveryOrder->lines->isEmpty()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'That delivery order has nothing to bill.',
            ]);

            return back();
        }

        $salesOrder = $deliveryOrder->isForSalesOrder() ? $deliveryOrder->salesOrder : null;
        $charged = (bool) $salesOrder?->sst;
        $charges = $request->charges();

        // The legacy screen read a misspelt field here, so the subtotal was
        // never stored. It is worked out from the despatch instead.
        $subtotal = $this->subtotal($deliveryOrder, $charged);
        $rate = (float) (Currency::query()->whereKey($salesOrder?->currency)->value('myrrate') ?? 1);

        $invoice = DB::transaction(function () use ($deliveryOrder, $salesOrder, $charged, $charges, $subtotal, $rate, $request) {
            $invoice = Invoice::create([
                'acct_invoiceno' => (int) Invoice::max('acct_invoiceno') + 1,
                'fsdno' => $deliveryOrder->salesorder,
                'indexno' => (string) $deliveryOrder->id,
                'subtotal' => $subtotal,
                'totalmyr' => round($subtotal * $rate, 2),
                'paymentterms' => $request->validated('paymentterms') ?? $salesOrder?->pay_terms,
                'misc_title' => $request->validated('misc_title'),
                'sst' => $charged ? 1 : 0,
                ...$charges,
            ]);

            // The despatch is billed now, which is what the listing reports.
            $deliveryOrder->update(['status' => 'invoiced']);

            return $invoice;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice created.']);

        return to_route('invoice.show', $invoice);
    }

    /** What the despatch comes to before charges. */
    private function subtotal(DeliveryOrder $deliveryOrder, bool $charged): float
    {
        return round((float) $deliveryOrder->lines->sum(
            fn (DeliveryOrderLine $line) => $line->actual_qty * $line->unit_price
                + ($charged ? (float) $line->sst : 0),
        ), 2);
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
