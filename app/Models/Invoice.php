<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * An invoice is raised against one despatch: fsdno names the sales order it
 * belongs to, indexno the delivery order whose lines it bills for.
 */
#[Fillable([
    'acct_invoiceno',
    'fsdno',
    'indexno',
    'subtotal',
    'totalmyr',
    'discount',
    'paymentterms',
    'transportation',
    'tax',
    'custom',
    'packing_charge',
    'misc',
    'misc_title',
    'sst',
])]
class Invoice extends Model
{
    protected $table = 'invoice';

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'fsdno');
    }

    public function deliveryOrder(): BelongsTo
    {
        return $this->belongsTo(DeliveryOrder::class, 'indexno');
    }

    /** The billed lines are the despatched ones. */
    public function lines(): HasMany
    {
        return $this->hasMany(DeliveryOrderLine::class, 'do_id', 'indexno')->orderBy('item');
    }

    /**
     * @return array{
     *     quantity: int, sst: float, subtotal: float, transportation: float,
     *     customs: float, packing: float, misc: float, tax: float,
     *     discount: float, grand_total: float
     * }
     */
    public function totals(): array
    {
        $charged = (bool) $this->sst;

        $subtotal = (float) $this->lines->sum(
            fn (DeliveryOrderLine $line) => $line->actual_qty * $line->unit_price
                + ($charged ? (float) $line->sst : 0),
        );

        $transportation = (float) $this->transportation;
        $customs = (float) $this->custom;
        $packing = (float) $this->packing_charge;
        $misc = (float) $this->misc;
        $discount = (float) $this->discount;
        // Duty only applies to the pre-SST era invoices that carry it.
        $tax = $charged ? 0.0 : (float) $this->tax;

        return [
            'quantity' => (int) $this->lines->sum('actual_qty'),
            'sst' => round($charged ? (float) $this->lines->sum('sst') : 0, 2),
            'subtotal' => round($subtotal, 2),
            'transportation' => $transportation,
            'customs' => $customs,
            'packing' => $packing,
            'misc' => $misc,
            'tax' => $tax,
            'discount' => $discount,
            'grand_total' => round(
                $subtotal + $transportation + $customs + $packing + $misc + $tax - $discount,
                2,
            ),
        ];
    }
}
