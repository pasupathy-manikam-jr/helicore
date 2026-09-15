<?php

namespace App\Http\Controllers;

use App\Models\Proforma;
use App\Models\SalesOrderLine;
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
            'can' => ['edit' => $request->user()->can('proforma-edit')],
        ]);
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
