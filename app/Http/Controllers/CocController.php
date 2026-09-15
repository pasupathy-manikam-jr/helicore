<?php

namespace App\Http\Controllers;

use App\Models\Coc;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class CocController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:coc-list', only: ['index', 'show']),
        ];
    }

    public function index(Request $request): Response
    {
        $cocs = Coc::query()
            ->with(['client:id,cname'])
            ->orderByDesc('id')
            ->get(['id', 'indexno', 'customer_no', 'fsdorder', 'quality_auth', 'remarks', 'rowno', 'created_at'])
            ->map(fn (Coc $coc) => [
                ...$coc->only(['id', 'indexno', 'fsdorder', 'quality_auth', 'remarks', 'created_at']),
                'client' => $coc->client?->cname,
                'line_count' => count($coc->lineIds()),
            ]);

        return Inertia::render('cocs/index', [
            'cocs' => $cocs,
            'can' => ['edit' => $request->user()->can('coc-edit')],
        ]);
    }

    public function show(Coc $coc): Response
    {
        $coc->load(['client:id,cname']);

        return Inertia::render('cocs/show', [
            'coc' => [
                ...$coc->only(['id', 'indexno', 'fsdorder', 'quality_auth', 'remarks', 'created_at']),
                'client' => $coc->client?->cname,
            ],
            'lines' => $coc->lines()->map->only([
                'id', 'item', 'product', 'stock_code', 'description', 'quantity',
                'unit', 'batch', 'type_of_certification',
            ]),
        ]);
    }
}
