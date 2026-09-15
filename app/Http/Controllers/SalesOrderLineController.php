<?php

namespace App\Http\Controllers;

use App\Http\Requests\SalesOrderLineRequest;
use App\Models\Currency;
use App\Models\Quotation;
use App\Models\SalesOrder;
use App\Models\SalesOrderLine;
use App\Models\Tax;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class SalesOrderLineController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:salesorder-edit', only: ['store', 'update', 'copy']),
            new Middleware('permission:salesorder-delete', only: ['destroy']),
        ];
    }

    public function store(SalesOrderLineRequest $request, SalesOrder $salesOrder): RedirectResponse
    {
        $line = new SalesOrderLine([
            ...$request->lineAttributes(),
            'fsdorder' => $salesOrder->id,
            'item' => (int) $salesOrder->lines()->max('item') + 1,
        ]);

        $this->price($line, $salesOrder);
        $line->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Line added.']);

        return back();
    }

    public function update(SalesOrderLineRequest $request, SalesOrder $salesOrder, SalesOrderLine $line): RedirectResponse
    {
        abort_unless($line->fsdorder === $salesOrder->id, 404);

        $line->fill($request->lineAttributes());
        $this->price($line, $salesOrder);
        $line->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Line updated.']);

        return back();
    }

    public function destroy(SalesOrder $salesOrder, SalesOrderLine $line): RedirectResponse
    {
        abort_unless($line->fsdorder === $salesOrder->id, 404);

        $line->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Line removed.']);

        return back();
    }

    /**
     * Copy a quotation's lines onto the order, which is how most sales orders
     * are filled: the customer accepted what was quoted.
     */
    public function copy(Request $request, SalesOrder $salesOrder): RedirectResponse
    {
        $validated = $request->validate([
            'quotation_id' => ['required', 'integer', 'exists:quote_refs,id'],
        ]);

        $quotation = Quotation::with('lines')->findOrFail($validated['quotation_id']);

        if ($quotation->lines->isEmpty()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Quotation {$quotation->id} has no line items.",
            ]);

            return back();
        }

        // Carry on from the highest item number already on the order rather
        // than repeating the quotation's numbering.
        $item = (int) $salesOrder->lines()->max('item');

        foreach ($quotation->lines as $quotationLine) {
            $line = new SalesOrderLine([
                'fsdorder' => $salesOrder->id,
                'item' => ++$item,
                'quantity' => $quotationLine->qty,
                'unit' => $quotationLine->unit,
                'product' => $quotationLine->product,
                'stock_code' => $quotationLine->stockcode,
                'std_stockcode' => $quotationLine->std_stockcode,
                'weight' => $quotationLine->weight,
                'description' => $quotationLine->description,
                'unit_price' => $quotationLine->price,
            ]);

            $this->price($line, $salesOrder);
            $line->save();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $quotation->lines->count()." line(s) copied from quotation {$quotation->id}.",
        ]);

        return back();
    }

    private function price(SalesOrderLine $line, SalesOrder $salesOrder): void
    {
        $sstRate = (float) (Tax::query()->where('name', 'SST')->value('value') ?? 0);
        $myrRate = (float) (Currency::query()->whereKey($salesOrder->currency)->value('myrrate') ?? 1);

        $line->applyPricing($sstRate, $myrRate, (bool) $salesOrder->sst);
    }
}
