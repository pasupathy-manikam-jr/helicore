<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use Illuminate\Support\Collection;
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
            'recentQuotations' => $this->recentQuotations(),
        ]);
    }

    /**
     * The newest quotations, identified the way the rest of the app does:
     * quote number and client first, with what the quotation comes to. Ordered
     * by id, which is monotonic, rather than by a date column the legacy app
     * did not always fill in.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function recentQuotations(): Collection
    {
        return Quotation::query()
            ->with(['lines', 'client:id,cname', 'currencyRef:id,name'])
            ->latest('id')
            ->limit(8)
            ->get()
            ->map(fn (Quotation $quotation) => [
                'id' => $quotation->id,
                'client' => $quotation->client?->cname,
                'your_ref' => $quotation->your_ref,
                'attnto' => $quotation->attnto,
                'currency' => $quotation->currencyRef?->name,
                'value' => $quotation->totals()['grand_total'],
                'created_at' => $quotation->created_at?->toDateTimeString(),
            ]);
    }
}
