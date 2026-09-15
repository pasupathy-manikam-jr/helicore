<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * An authority for expenditure: the purchase order raised against a supplier,
 * approved by one or more managers before it can be issued.
 */
#[Fillable([
    'potype',
    'supplier_id',
    'supplier_category_id',
    'suppliersubcat',
    'suppquoteno',
    'currency_id',
    'originator',
    'salesorder',
    'buyingfrom',
    'eta',
    'payment_terms',
    'terms',
    'comments',
    'attachment',
    'status',
    'reference',
    'forward_status',
])]
class Afe extends Model
{
    protected $table = 'afe';

    public function lines(): HasMany
    {
        return $this->hasMany(AfeLine::class, 'afe_id')->orderBy('item');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function currencyRef(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id');
    }

    /**
     * The approval column holds a JSON object keyed by approver id, each entry
     * carrying that approver's decision and the date they made it.
     *
     * @return array<int, array{id: int, name: string|null, status: string, date: string|null}>
     */
    public function approvals(): array
    {
        $decoded = json_decode((string) $this->approval, true);

        if (! is_array($decoded)) {
            return [];
        }

        $names = User::query()
            ->whereIn('id', array_map('intval', array_keys($decoded)))
            ->pluck('name', 'id');

        $approvals = [];

        foreach ($decoded as $key => $entry) {
            if (! is_array($entry)) {
                continue;
            }

            $id = (int) ($entry['id'] ?? $key);

            $approvals[] = [
                'id' => $id,
                'name' => $names[$id] ?? null,
                'status' => strtolower((string) ($entry['status'] ?? '')),
                'date' => $entry['date'] ?? null,
            ];
        }

        return $approvals;
    }

    /**
     * Records one approver's decision, leaving everyone else's alone. The
     * column is a JSON object keyed by approver id.
     */
    public function recordApproval(User $approver, string $status): void
    {
        $decoded = json_decode((string) $this->approval, true);
        $approvals = is_array($decoded) ? $decoded : [];

        $approvals[(string) $approver->id] = [
            'id' => $approver->id,
            'status' => $status,
            'date' => now()->format('d-m-Y'),
        ];

        $this->approval = json_encode($approvals);
        $this->final_approval_date = now()->toDateString();
        $this->save();
    }

    /** Whether every approver on the AFE has said yes. */
    public function isApproved(): bool
    {
        $approvals = $this->approvals();

        return $approvals !== []
            && ! collect($approvals)->contains(fn (array $approval) => $approval['status'] !== 'yes');
    }

    /**
     * @return array{quantity: int, subtotal: float, myr: float}
     */
    public function totals(): array
    {
        return [
            'quantity' => (int) $this->lines->sum('qty'),
            'subtotal' => round((float) $this->lines->sum('total'), 2),
            'myr' => round((float) $this->lines->sum('totalmyr'), 2),
        ];
    }

    /** @return array<int, string> */
    public function attachments(): array
    {
        return array_values(array_filter(explode(',', (string) $this->attachment)));
    }
}
