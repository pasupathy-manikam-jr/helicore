<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierRequest;
use App\Models\Supplier;
use App\Models\SupplierCategory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller implements HasMiddleware
{
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

        // Legacy rows keep category ids in a comma separated column, so resolve
        // the labels in PHP rather than with a join. The group travels with the
        // label because it drives the colour the chip is drawn in.
        $labels = $categories->keyBy('id');

        $suppliers = Supplier::query()
            ->with('approverUser:id,name')
            ->orderBy('supplier_name')
            ->get()
            ->map(fn (Supplier $supplier) => [
                'id' => $supplier->id,
                'supplier_name' => $supplier->supplier_name,
                'approval' => $supplier->approval,
                'supplier_category_id' => $supplier->categoryIds(),
                'subcategories' => array_values(array_filter(array_map(
                    fn (int $id) => $labels->has($id) ? [
                        'label' => $labels[$id]->subcategory,
                        'group' => $labels[$id]->category,
                    ] : null,
                    $supplier->categoryIds(),
                ))),
                'approver' => $supplier->approver,
                'approver_name' => $supplier->approverUser?->name,
                'regno' => $supplier->regno,
                'gst_regno' => $supplier->gst_regno,
                'address' => $supplier->address,
                'contact' => $supplier->contact,
                'contactperson' => $supplier->contactperson,
            ]);

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
            'categories' => $categories,
            'managers' => User::query()
                ->where('position', 'Manager')
                ->orderBy('name')
                ->get(['id', 'name']),
            'can' => [
                'create' => $request->user()->can('supplier-create'),
                'edit' => $request->user()->can('supplier-edit'),
                'delete' => $request->user()->can('supplier-delete'),
            ],
        ]);
    }

    public function store(SupplierRequest $request): RedirectResponse
    {
        Supplier::create($request->supplierAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Supplier created.']);

        return back();
    }

    public function update(SupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $supplier->update($request->supplierAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Supplier updated.']);

        return back();
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $supplier->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Supplier deleted.']);

        return back();
    }
}
