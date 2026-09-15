<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReceivingNoteRequest;
use App\Models\Afe;
use App\Models\AfeLine;
use App\Models\ReceivingNote;
use App\Models\ReceivingNoteLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReceivingNoteController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:receivenote-list', only: ['index']),
            new Middleware('permission:receivenote-show', only: ['show']),
            new Middleware('permission:receivenote-create', only: ['create', 'store']),
        ];
    }

    public function index(Request $request): Response
    {
        $notes = ReceivingNote::query()
            ->leftJoin('afe', 'receivenote.afe_id', '=', 'afe.id')
            ->leftJoin('supplier', 'afe.supplier_id', '=', 'supplier.id')
            ->select([
                'receivenote.id',
                'receivenote.afe_id',
                'receivenote.supplierinvoice',
                'receivenote.deliverydate',
                'receivenote.awb',
                'receivenote.osc',
                'receivenote.user',
                'receivenote.preparedate',
                'receivenote.created_at',
                'supplier.supplier_name as supplier',
            ])
            // After the select, so the count is added rather than replaced.
            ->withCount('lines')
            ->orderByDesc('receivenote.id')
            ->get();

        return Inertia::render('receiving-notes/index', [
            'notes' => $notes,
            'can' => ['edit' => $request->user()->can('receivenote-edit')],
        ]);
    }

    /**
     * A receiving note is always raised against an AFE, so the form starts
     * from that AFE's lines and what has already been received against them.
     */
    public function create(Afe $afe): Response
    {
        $afe->load(['lines', 'supplier:id,supplier_name']);

        $alreadyReceived = ReceivingNoteLine::query()
            ->where('afe_id', $afe->id)
            ->groupBy('afe_descs_id')
            ->selectRaw('afe_descs_id, sum(qty_delivered) as received')
            ->get()
            ->mapWithKeys(fn (ReceivingNoteLine $line) => [
                (int) $line->afe_descs_id => (float) $line->received,
            ]);

        return Inertia::render('receiving-notes/form', [
            'afe' => [
                ...$afe->only(['id', 'potype', 'suppquoteno', 'salesorder']),
                'supplier' => $afe->supplier?->supplier_name,
            ],
            'lines' => $afe->lines->map(fn (AfeLine $line) => [
                ...$line->only(['id', 'item', 'product', 'stock_code', 'description', 'qty']),
                'already_received' => (float) ($alreadyReceived[$line->id] ?? 0),
            ]),
        ]);
    }

    public function store(ReceivingNoteRequest $request): RedirectResponse
    {
        $quantities = $request->receivedQuantities();

        if ($quantities === []) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Enter a quantity against at least one line.',
            ]);

            return back();
        }

        $lines = AfeLine::query()
            ->where('afe_id', $request->validated('afe_id'))
            ->whereIn('id', array_keys($quantities))
            ->get();

        $note = DB::transaction(function () use ($request, $lines, $quantities) {
            $note = ReceivingNote::create([
                ...$request->safe()->except('quantities'),
                'user' => $request->user()->id,
                'preparedate' => now()->toDateString(),
            ]);

            foreach ($lines as $line) {
                $note->lines()->create([
                    'afe_descs_id' => $line->id,
                    'afe_id' => $line->afe_id,
                    'qty_delivered' => $quantities[$line->id],
                    'product' => $line->product,
                    'stock_code' => $line->stock_code,
                    'description' => $line->description,
                ]);
            }

            return $note;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Receiving note created.']);

        return to_route('receiving-note.show', $note);
    }

    public function show(ReceivingNote $receivingNote): Response
    {
        $receivingNote->load(['lines', 'afe.supplier:id,supplier_name']);

        return Inertia::render('receiving-notes/show', [
            'note' => [
                ...$receivingNote->only([
                    'id', 'afe_id', 'supplierinvoice', 'deliverydate', 'awb',
                    'osc', 'user', 'preparedate', 'remarks', 'created_at',
                ]),
                'supplier' => $receivingNote->afe?->supplier?->supplier_name,
            ],
            'lines' => $receivingNote->lines->map->only([
                'id', 'afe_descs_id', 'product', 'stock_code', 'description',
                'qty_delivered', 'after_delivery_date', 'workorder_id', 'remarks',
            ]),
        ]);
    }
}
