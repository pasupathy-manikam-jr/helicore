<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuotationRequest;
use App\Models\Client;
use App\Models\Currency;
use App\Models\Quotation;
use App\Models\QuotationLine;
use App\Models\Tnc;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class QuotationController extends Controller implements HasMiddleware
{
    /**
     * Columns the listing may be ordered by, mapped to what the query selects.
     */
    private const SORTABLE = [
        'id' => 'quote_refs.id',
        'client' => 'company_details.cname',
        'your_ref' => 'quote_refs.your_ref',
        'rfq' => 'quote_refs.rfq',
        'attnto' => 'quote_refs.attnto',
        'issuer' => 'issuer.name',
        'revno' => 'quote_refs.revno',
        'created_at' => 'quote_refs.created_at',
    ];

    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:quotation-list', only: ['index']),
            new Middleware('permission:quotation-show', only: ['show', 'attachment']),
            new Middleware('permission:quotation-create', only: ['create', 'store']),
            new Middleware('permission:quotation-edit', only: ['edit', 'update']),
        ];
    }

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in(array_keys(self::SORTABLE))],
            'dir' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
        ]);

        $sort = $filters['sort'] ?? 'id';
        $direction = $filters['dir'] ?? 'desc';
        $search = trim($filters['q'] ?? '');

        // Nearly 16k quotations, so this listing is paged, filtered and sorted
        // in the database rather than shipped whole to the browser.
        $quotations = Quotation::query()
            ->leftJoin('company_details', 'quote_refs.company_details_id', '=', 'company_details.id')
            ->leftJoin('users as issuer', 'quote_refs.issuermail', '=', 'issuer.id')
            // currency is a varchar holding the currency id.
            ->leftJoin('currency', 'quote_refs.currency', '=', 'currency.id')
            ->select([
                'quote_refs.id',
                'quote_refs.your_ref',
                'quote_refs.rfq',
                'quote_refs.attnto',
                'quote_refs.revno',
                'quote_refs.sst',
                'currency.name as currency',
                'quote_refs.so_ref',
                'quote_refs.created_at',
                'company_details.cname as client',
                'issuer.name as issuer',
            ])
            ->when($search !== '', function ($query) use ($search) {
                $like = '%'.$search.'%';

                $query->where(function ($query) use ($like, $search) {
                    $query->where('quote_refs.id', $search)
                        ->orWhere('company_details.cname', 'like', $like)
                        ->orWhere('quote_refs.your_ref', 'like', $like)
                        ->orWhere('quote_refs.rfq', 'like', $like)
                        ->orWhere('quote_refs.attnto', 'like', $like)
                        ->orWhere('quote_refs.so_ref', 'like', $like);
                });
            })
            ->orderBy(self::SORTABLE[$sort], $direction)
            ->paginate($filters['per_page'] ?? 25)
            ->withQueryString();

        return Inertia::render('quotations/index', [
            'quotations' => $quotations->items(),
            'total' => $quotations->total(),
            'filters' => [
                'q' => $search,
                'sort' => $sort,
                'dir' => $direction,
                'page' => $quotations->currentPage(),
                'per_page' => $quotations->perPage(),
            ],
            'can' => [
                'show' => $request->user()->can('quotation-show'),
                'create' => $request->user()->can('quotation-create'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('quotations/form', [
            'quotation' => null,
            ...$this->formOptions(),
        ]);
    }

    public function store(QuotationRequest $request): RedirectResponse
    {
        $quotation = Quotation::create([
            ...$request->quotationAttributes(),
            'attachment' => $this->storeAttachments($request),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Quotation created.']);

        return to_route('quotation.show', $quotation);
    }

    public function edit(Quotation $quotation): Response
    {
        return Inertia::render('quotations/form', [
            'quotation' => [
                ...$quotation->only([
                    'id', 'company_details_id', 'attnto', 'clientemail', 'client_buyer_name',
                    'your_ref', 'rfq', 'revno', 'sst', 'issuermail', 'user_email', 'currency',
                    'tnc', 'quote_basis', 'delivery', 'bid_valid', 'pay_terms',
                    'tender_close_date', 'packcost', 'custom', 'misc', 'miscvalue',
                    'freight', 'discount',
                ]),
                'attachments' => $quotation->attachments(),
            ],
            ...$this->formOptions(),
        ]);
    }

    public function update(QuotationRequest $request, Quotation $quotation): RedirectResponse
    {
        $added = $this->storeAttachments($request);

        $quotation->update([
            ...$request->quotationAttributes(),
            'attachment' => implode(',', array_filter([
                ...$quotation->attachments(),
                ...($added === null ? [] : explode(',', $added)),
            ])),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Quotation updated.']);

        return to_route('quotation.show', $quotation);
    }

    /**
     * Attachments are streamed through this route rather than served from the
     * public disk, so they stay behind the quotation permissions.
     */
    public function attachment(Quotation $quotation, int $index): StreamedResponse
    {
        $path = $quotation->attachments()[$index] ?? abort(404);

        abort_unless(Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->download($path, basename($path));
    }

    public function show(Request $request, Quotation $quotation): Response
    {
        $quotation->load(['client', 'lines', 'salesperson:id,name', 'issuer:id,name', 'currencyRef', 'tncRef:id,name']);

        return Inertia::render('quotations/show', [
            'quotation' => [
                ...$quotation->only([
                    'id', 'your_ref', 'rfq', 'attnto', 'clientemail', 'revno', 'sst',
                    'quote_basis', 'delivery', 'bid_valid', 'pay_terms', 'misc',
                    'tender_close_date', 'client_buyer_name', 'so_ref', 'created_at',
                ]),
                'client' => $quotation->client?->only(['id', 'cname', 'address', 'city', 'state', 'country', 'phone', 'fax']),
                'currency' => $quotation->currencyRef?->name,
                'terms' => $quotation->tncRef?->name,
                'salesperson' => $quotation->salesperson?->name,
                'issuer' => $quotation->issuer?->name,
                'attachments' => $quotation->attachments(),
            ],
            'lines' => $quotation->lines->map(fn (QuotationLine $line) => [
                ...$line->only([
                    'id', 'item', 'product', 'stockcode', 'std_stockcode', 'description',
                    'unit', 'qty', 'weight', 'cost_price', 'shipping_cost', 'mark_up',
                    'import_duty', 'pomaterialcode', 'price', 'total', 'sst',
                ]),
                // Older rows already have SST folded into the stored total, so
                // deriving the line total keeps it consistent with the footer,
                // which has always summed qty x price.
                'line_total' => $line->lineTotal((bool) $quotation->sst),
                'line_weight' => round((float) $line->qty * (float) $line->weight, 2),
            ]),
            'totals' => $quotation->totals(),
            'can' => [
                'edit' => $request->user()->can('quotation-edit'),
                'addLine' => $request->user()->can('quotation-product-add'),
                'deleteLine' => $request->user()->can('quotation-delete'),
            ],
        ]);
    }

    /**
     * The reference data every quotation form needs.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'clients' => Client::query()->orderBy('cname')->get(['id', 'cname']),
            'currencies' => Currency::query()->orderBy('name')->get(['id', 'name']),
            'terms' => Tnc::query()->orderBy('name')->get(['id', 'name']),
            'salespeople' => User::query()
                ->where('department', 'Sales')
                ->orderBy('name')
                ->get(['id', 'name']),
        ];
    }

    /** Returns the comma separated paths the legacy column expects. */
    private function storeAttachments(QuotationRequest $request): ?string
    {
        $paths = array_map(
            fn ($file) => $file->store('quotation'),
            $request->file('attachments', []),
        );

        return $paths === [] ? null : implode(',', $paths);
    }
}
