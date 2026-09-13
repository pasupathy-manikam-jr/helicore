<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuotationLineRequest;
use App\Models\Currency;
use App\Models\Quotation;
use App\Models\QuotationLine;
use App\Models\Tax;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class QuotationLineController extends Controller implements HasMiddleware
{
    /**
     * Adding a line has its own legacy permission; changing and removing one
     * follow the quotation's.
     *
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:quotation-product-add', only: ['store']),
            new Middleware('permission:quotation-edit', only: ['update']),
            new Middleware('permission:quotation-delete', only: ['destroy']),
        ];
    }

    public function store(QuotationLineRequest $request, Quotation $quotation): RedirectResponse
    {
        $line = new QuotationLine([
            ...$request->lineAttributes(),
            'our_ref' => $quotation->id,
            'item' => (int) $quotation->lines()->max('item') + 1,
        ]);

        $this->price($line, $quotation);
        $line->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Line added.']);

        return back();
    }

    public function update(QuotationLineRequest $request, Quotation $quotation, QuotationLine $line): RedirectResponse
    {
        abort_unless($line->our_ref === $quotation->id, 404);

        $line->fill($request->lineAttributes());
        $this->price($line, $quotation);
        $line->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Line updated.']);

        return back();
    }

    public function destroy(Quotation $quotation, QuotationLine $line): RedirectResponse
    {
        abort_unless($line->our_ref === $quotation->id, 404);

        $line->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Line removed.']);

        return back();
    }

    /**
     * SST is a single configured rate, and the MYR figure is stored alongside
     * the quotation currency's own total.
     */
    private function price(QuotationLine $line, Quotation $quotation): void
    {
        $sstRate = (float) (Tax::query()->where('name', 'SST')->value('value') ?? 0);
        $myrRate = (float) (Currency::query()->whereKey($quotation->currency)->value('myrrate') ?? 1);

        $line->applyPricing($sstRate, $myrRate, (bool) $quotation->sst);
    }
}
