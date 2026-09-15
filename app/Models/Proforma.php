<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A proforma is quoted against a sales order before anything ships, so its
 * lines are the ordered ones rather than the despatched ones.
 */
#[Fillable([
    'fsdno',
    'indexno',
    'subtotal',
    'totalmyr',
    'discount',
    'paymentdue',
    'transportation',
    'tax',
    'custom',
    'packing_charge',
    'misc',
    'misc_title',
    'sst',
])]
class Proforma extends Model
{
    protected $table = 'proforma';

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'fsdno');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(SalesOrderLine::class, 'fsdorder', 'fsdno')->orderBy('item');
    }

    /**
     * @return array{
     *     quantity: int, sst: float, subtotal: float, transportation: float,
     *     customs: float, packing: float, misc: float, discount: float,
     *     grand_total: float
     * }
     */
    public function totals(): array
    {
        $charged = (bool) $this->sst;

        $subtotal = (float) $this->lines->sum(
            fn (SalesOrderLine $line) => $line->lineTotal($charged),
        );

        $transportation = (float) $this->transportation;
        $customs = (float) $this->custom;
        $packing = (float) $this->packing_charge;
        $misc = (float) $this->misc;
        $discount = (float) $this->discount;

        return [
            'quantity' => (int) $this->lines->sum('quantity'),
            'sst' => round($charged ? (float) $this->lines->sum('sst') : 0, 2),
            'subtotal' => round($subtotal, 2),
            'transportation' => $transportation,
            'customs' => $customs,
            'packing' => $packing,
            'misc' => $misc,
            'discount' => $discount,
            'grand_total' => round(
                $subtotal + $transportation + $customs + $packing + $misc - $discount,
                2,
            ),
        ];
    }
}
