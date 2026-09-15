<?php

namespace App\Http\Controllers;

use App\Models\PackingList;
use App\Models\PackingListLine;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PackingListController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:pl-list', only: ['index', 'show']),
        ];
    }

    public function index(Request $request): Response
    {
        $lineCounts = DB::table('packinglist_content')
            ->groupBy('packingid')
            // `lines` is reserved in MySQL, hence the alias.
            ->selectRaw('packingid, count(*) as total')
            ->pluck('total', 'packingid');

        $lists = PackingList::query()
            ->orderByDesc('id')
            ->get()
            ->map(fn (PackingList $list) => [
                ...$list->only(['id', 'ref', 'altcustomername', 'created_at']),
                'sales_orders' => $list->salesOrderIds(),
                'line_count' => (int) ($lineCounts[$list->id] ?? 0),
            ]);

        return Inertia::render('packing-lists/index', [
            'lists' => $lists,
            'can' => ['edit' => $request->user()->can('pl-edit')],
        ]);
    }

    public function show(PackingList $packingList): Response
    {
        $packingList->load('lines');

        // Packing list rows point at a despatch and the item number within it,
        // not at a line id, so the description is looked up on that pair.
        $despatchLines = DB::table('loading_note_content')
            ->whereIn('do_id', $packingList->lines->pluck('do_id')->unique()->filter())
            ->get(['do_id', 'item', 'stockcode', 'description', 'actual_qty'])
            ->keyBy(fn ($line) => $line->do_id.':'.$line->item);

        return Inertia::render('packing-lists/show', [
            'list' => [
                ...$packingList->only(['id', 'ref', 'altcustomername', 'created_at']),
                'sales_orders' => $packingList->salesOrderIds(),
            ],
            'lines' => $packingList->lines->map(function (PackingListLine $line) use ($despatchLines) {
                $despatch = $despatchLines->get($line->do_id.':'.$line->item);

                return [
                    ...$line->only(['id', 'salesorder', 'do_id', 'item', 'unit_weight', 'unit_value', 'decuval']),
                    'stockcode' => $despatch->stockcode ?? null,
                    'description' => $despatch->description ?? null,
                    'quantity' => $despatch->actual_qty ?? null,
                ];
            }),
            'totals' => $packingList->totals(),
        ]);
    }
}
