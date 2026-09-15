<?php

namespace App\Http\Controllers;

use App\Models\StockSold;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller implements HasMiddleware
{
    /**
     * The legacy controller asks for reports-* permissions that were never
     * created, which locks the screen for everyone. This is sales history, so
     * it follows the sales order permission.
     *
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            'permission:salesorder-list',
        ];
    }

    public function stockSold(Request $request): Response
    {
        $filters = $request->validate([
            'product' => ['nullable', Rule::in(array_keys(StockSold::PRODUCTS))],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2100'],
        ]);

        $product = $filters['product'] ?? array_key_first(StockSold::PRODUCTS);

        // Only the years this product actually has figures for.
        $years = StockSold::forProduct($product)
            ->whereNotNull('year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($year) => (int) $year)
            ->all();

        $year = $filters['year'] ?? ($years[0] ?? null);

        $rows = $year === null
            ? collect()
            : StockSold::forProduct($product)
                ->where('year', $year)
                ->orderBy('stockcode')
                ->get()
                ->map(fn (StockSold $row) => [
                    'id' => $row->id,
                    'stockcode' => $row->stockcode,
                    ...collect(array_keys(StockSold::MONTHS))
                        ->mapWithKeys(fn (string $month) => [$month => (int) $row->{$month}])
                        ->all(),
                    'total' => $row->yearTotal(),
                    'despatches' => $row->despatches(),
                ]);

        return Inertia::render('reports/stock-sold', [
            'product' => $product,
            'products' => collect(StockSold::PRODUCTS)
                ->map(fn (array $meta, string $key) => ['value' => $key, 'label' => $meta['label']])
                ->values(),
            'year' => $year,
            'years' => $years,
            'months' => StockSold::MONTHS,
            'rows' => $rows,
        ]);
    }
}
