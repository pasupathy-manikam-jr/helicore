<?php

namespace App\Http\Controllers;

use App\Http\Requests\AfeRequest;
use App\Models\Afe;
use App\Models\Currency;
use App\Models\Supplier;
use App\Models\SupplierCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AfeController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:afe-index', only: ['index']),
            new Middleware('permission:afe-show', only: ['show']),
            new Middleware('permission:afe-create', only: ['create', 'store']),
            new Middleware('permission:afe-edit', only: ['edit', 'update']),
            new Middleware('permission:afe-approve', only: ['approve']),
        ];
    }

    public function index(Request $request): Response
    {
        $afes = Afe::query()
            ->with(['supplier:id,supplier_name', 'currencyRef:id,name'])
            ->orderByDesc('id')
            ->get([
                'id', 'potype', 'supplier_id', 'currency_id', 'approval', 'approvalstatus',
                'status', 'salesorder', 'reference', 'eta', 'actarrival',
                'final_approval_date', 'created_at',
            ])
            ->map(fn (Afe $afe) => [
                ...$afe->only([
                    'id', 'potype', 'approvalstatus', 'status', 'salesorder',
                    'reference', 'eta', 'actarrival', 'final_approval_date', 'created_at',
                ]),
                'supplier' => $afe->supplier?->supplier_name,
                'currency' => $afe->currencyRef?->name,
                'approved' => $afe->isApproved(),
                'delay' => $this->delayInDays($afe),
            ]);

        return Inertia::render('afes/index', [
            'afes' => $afes,
            'can' => [
                'show' => $request->user()->can('afe-show'),
                'approve' => $request->user()->can('afe-approve'),
                'create' => $request->user()->can('afe-create'),
                'receive' => $request->user()->can('receivenote-create'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('afes/form', [
            'afe' => null,
            ...$this->formOptions(),
        ]);
    }

    public function store(AfeRequest $request): RedirectResponse
    {
        $afe = Afe::create([
            ...$request->afeAttributes(),
            'attachment' => $this->storeAttachments($request),
            'forward_status' => 0,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'AFE created.']);

        return to_route('afe.show', $afe);
    }

    public function edit(Afe $afe): Response
    {
        return Inertia::render('afes/form', [
            'afe' => [
                ...$afe->only([
                    'id', 'potype', 'supplier_id', 'supplier_category_id',
                    'suppquoteno', 'currency_id', 'originator', 'salesorder',
                    'buyingfrom', 'eta', 'payment_terms', 'terms', 'comments',
                ]),
                'attachments' => $afe->attachments(),
            ],
            ...$this->formOptions(),
        ]);
    }

    public function update(AfeRequest $request, Afe $afe): RedirectResponse
    {
        $added = $this->storeAttachments($request);

        $afe->update([
            ...$request->afeAttributes(),
            'attachment' => implode(',', array_filter([
                ...$afe->attachments(),
                ...($added === null ? [] : explode(',', $added)),
            ])),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'AFE updated.']);

        return to_route('afe.show', $afe);
    }

    public function show(Request $request, Afe $afe): Response
    {
        $afe->load(['lines', 'supplier', 'currencyRef']);

        return Inertia::render('afes/show', [
            'afe' => [
                ...$afe->only([
                    'id', 'potype', 'originator', 'approvalstatus', 'status', 'comments',
                    'reference', 'suppquoteno', 'terms', 'payment_terms', 'eta',
                    'actarrival', 'salesorder', 'buyingfrom', 'suppliersubcat',
                    'final_approval_date', 'created_at',
                ]),
                'supplier' => $afe->supplier?->only(['id', 'supplier_name', 'address', 'contact', 'contactperson']),
                'currency' => $afe->currencyRef?->name,
                'approved' => $afe->isApproved(),
                'approvals' => $afe->approvals(),
                'attachments' => $afe->attachments(),
            ],
            'lines' => $afe->lines->map->only([
                'id', 'item', 'product', 'stock_code', 'description', 'qty',
                'unitvalue', 'total', 'totalmyr', 'gst',
            ]),
            'totals' => $afe->totals(),
            'can' => [
                'edit' => $request->user()->can('afe-edit'),
                'deleteLine' => $request->user()->can('afe-delete'),
                'approve' => $request->user()->can('afe-approve'),
            ],
            // What the signed in user has already said, if anything.
            'myApproval' => collect($afe->approvals())
                ->firstWhere('id', $request->user()->id)['status'] ?? null,
        ]);
    }

    /**
     * How late the goods arrived against the estimate, in whole days. The
     * legacy columns are free text dates, so anything unparseable is skipped.
     */
    private function delayInDays(Afe $afe): ?int
    {
        if (blank($afe->eta) || blank($afe->actarrival)) {
            return null;
        }

        $eta = strtotime((string) $afe->eta);
        $arrived = strtotime((string) $afe->actarrival);

        if ($eta === false || $arrived === false) {
            return null;
        }

        return (int) round(($arrived - $eta) / 86400);
    }

    /**
     * Records the signed in user's decision on the AFE. The approver is taken
     * from the session rather than the form, so nobody can sign for someone
     * else.
     */
    public function approve(Request $request, Afe $afe): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['yes', 'no', 'rej'])],
        ]);

        $afe->recordApproval($request->user(), $validated['status']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => match ($validated['status']) {
                'yes' => 'AFE approved.',
                'no' => 'AFE marked not approved.',
                default => 'AFE rejected.',
            },
        ]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'suppliers' => Supplier::query()
                ->orderBy('supplier_name')
                ->get(['id', 'supplier_name']),
            'categories' => SupplierCategory::query()
                ->orderBy('category')
                ->orderBy('subcategory')
                ->get(['id', 'category', 'subcategory']),
            'currencies' => Currency::query()->orderBy('name')->get(['id', 'name']),
        ];
    }

    /**
     * Returns the comma separated paths the legacy column expects. The legacy
     * controller wrote these to an `attach` column the table does not have,
     * so uploads never survived; they are stored properly here.
     */
    private function storeAttachments(AfeRequest $request): ?string
    {
        $paths = array_map(
            fn ($file) => $file->store('afe'),
            $request->file('attachments', []),
        );

        return $paths === [] ? null : implode(',', $paths);
    }
}
