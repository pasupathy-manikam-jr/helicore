<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Legacy tables the dashboard summarises, keyed by the label shown on the tile.
     */
    private const TILES = [
        'Quotations' => 'quote_refs',
        'Sales orders' => 'sales_orders',
        'Invoices' => 'invoice',
        'AFEs' => 'afe',
    ];

    public function __invoke(): Response
    {
        $since = now()->subDays(30);

        $stats = collect(self::TILES)
            ->map(fn (string $table, string $label) => [
                'label' => $label,
                'total' => DB::table($table)->count(),
                'recent' => DB::table($table)->where('created_at', '>=', $since)->count(),
            ])
            ->values();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'pendingAfes' => DB::table('afe')->where('approvalstatus', '!=', 'Yes')->count(),
            'supplierCount' => DB::table('supplier')->count(),
            'recentQuotations' => DB::table('quote_refs')
                ->latest('created_at')
                ->limit(8)
                ->get(['id', 'your_ref', 'attnto', 'client_buyer_name', 'created_at']),
        ]);
    }
}
