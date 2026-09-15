<?php

namespace App\Http\Controllers;

use App\Http\Requests\AfeLineRequest;
use App\Models\Afe;
use App\Models\AfeLine;
use App\Models\Currency;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class AfeLineController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:afe-edit', only: ['store', 'update']),
            new Middleware('permission:afe-delete', only: ['destroy']),
        ];
    }

    public function store(AfeLineRequest $request, Afe $afe): RedirectResponse
    {
        $line = new AfeLine([
            ...$request->validated(),
            'afe_id' => $afe->id,
            'item' => (string) ((int) $afe->lines()->max('item') + 1),
        ]);

        $line->applyPricing($this->myrRate($afe));
        $line->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Line added.']);

        return back();
    }

    public function update(AfeLineRequest $request, Afe $afe, AfeLine $line): RedirectResponse
    {
        abort_unless($line->afe_id === $afe->id, 404);

        $line->fill($request->validated());
        $line->applyPricing($this->myrRate($afe));
        $line->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Line updated.']);

        return back();
    }

    public function destroy(Afe $afe, AfeLine $line): RedirectResponse
    {
        abort_unless($line->afe_id === $afe->id, 404);

        $line->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Line removed.']);

        return back();
    }

    private function myrRate(Afe $afe): float
    {
        return (float) (Currency::query()->whereKey($afe->currency_id)->value('myrrate') ?? 1);
    }
}
