<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierCategoryRequest;
use App\Models\Supplier;
use App\Models\SupplierCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class SupplierCategoryController extends Controller implements HasMiddleware
{
    /** @var array<int, int>|null */
    private ?array $supplierCounts = null;

    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:supplier-list', only: ['index']),
            new Middleware('permission:supplier-create', only: ['store']),
            new Middleware('permission:supplier-edit', only: ['update']),
            new Middleware('permission:supplier-delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        $categories = SupplierCategory::query()
            ->orderBy('category')
            ->orderBy('subcategory')
            ->get(['id', 'category', 'subcategory']);

        return Inertia::render('supplier-categories/index', [
            'categories' => $categories->map(fn (SupplierCategory $category) => [
                ...$category->only('id', 'category', 'subcategory'),
                'supplier_count' => $this->supplierCounts()[$category->id] ?? 0,
            ]),
            'can' => [
                'create' => $request->user()->can('supplier-create'),
                'edit' => $request->user()->can('supplier-edit'),
                'delete' => $request->user()->can('supplier-delete'),
            ],
        ]);
    }

    public function store(SupplierCategoryRequest $request): RedirectResponse
    {
        SupplierCategory::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category created.']);

        return back();
    }

    public function update(SupplierCategoryRequest $request, SupplierCategory $supplierCategory): RedirectResponse
    {
        $supplierCategory->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated.']);

        return back();
    }

    public function destroy(SupplierCategory $supplierCategory): RedirectResponse
    {
        if (($this->supplierCounts()[$supplierCategory->id] ?? 0) > 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'That category is still assigned to suppliers.',
            ]);

            return back();
        }

        $supplierCategory->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted.']);

        return back();
    }

    /**
     * Suppliers store their categories as a comma separated string, so the
     * usage count has to be tallied in PHP rather than with a join.
     *
     * @return array<int, int>
     */
    private function supplierCounts(): array
    {
        if ($this->supplierCounts !== null) {
            return $this->supplierCounts;
        }

        $counts = [];

        foreach (Supplier::query()->pluck('supplier_category_id') as $ids) {
            foreach (array_filter(array_map('intval', explode(',', (string) $ids))) as $id) {
                $counts[$id] = ($counts[$id] ?? 0) + 1;
            }
        }

        return $this->supplierCounts = $counts;
    }
}
