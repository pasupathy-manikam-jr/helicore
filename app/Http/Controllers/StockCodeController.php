<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockItemRequest;
use App\Models\StockItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StockCodeController extends Controller implements HasMiddleware
{
    /**
     * The legacy permissions table has a single row for this screen, so both
     * viewing and editing hang off it.
     *
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            'permission:product-stockcodedescription',
        ];
    }

    public function index(Request $request): Response
    {
        $product = $this->product($request->query('product'));

        $items = StockItem::forProduct($product)
            ->orderBy('main_code')
            ->orderBy('stock_code')
            ->get([
                'id', 'stock_code', 'main_code', 'size', 'rating', 'description',
                'weight', 'price', 'stock_take', 'stock_out', 'balance',
            ]);

        return Inertia::render('stock-codes/index', [
            'product' => $product,
            'products' => collect(StockItem::PRODUCTS)
                ->map(fn (array $meta, string $key) => ['value' => $key, 'label' => $meta['label']])
                ->values(),
            'items' => $items,
            'can' => ['edit' => $request->user()->can('product-stockcodedescription')],
        ]);
    }

    public function update(StockItemRequest $request, string $product, int $id): RedirectResponse
    {
        $item = StockItem::forProduct($this->product($product))->findOrFail($id);

        $item->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock code updated.']);

        return back();
    }

    /**
     * Falls back to the first product so the screen always has something to
     * show, and rejects anything that is not a known product line.
     */
    private function product(?string $product): string
    {
        return validator(
            ['product' => $product ?? array_key_first(StockItem::PRODUCTS)],
            ['product' => ['required', Rule::in(array_keys(StockItem::PRODUCTS))]],
        )->validate()['product'];
    }
}
