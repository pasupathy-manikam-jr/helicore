<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A despatch against a sales order, work order or stock order transfer. The
 * legacy table is called loading_note; the screens call it a delivery order.
 */
#[Fillable([
    'type',
    'salesorder',
    'customer_order',
    'total_fsd_items',
    'delivered_fsd_items',
    'status',
])]
class DeliveryOrder extends Model
{
    protected $table = 'loading_note';

    public function lines(): HasMany
    {
        return $this->hasMany(DeliveryOrderLine::class, 'do_id')->orderBy('item');
    }

    /**
     * The source document. Only sales orders are ported so far; the column
     * holds a work order or stock order transfer id for the other two types.
     */
    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'salesorder');
    }

    public function isForSalesOrder(): bool
    {
        return $this->type === 'salesorder';
    }

    /** Whether every item on the source document has now gone out. */
    public function isComplete(): bool
    {
        return (int) $this->total_fsd_items > 0
            && (int) $this->delivered_fsd_items >= (int) $this->total_fsd_items;
    }

    /**
     * @return array{quantity: int, delivered: int, weight: float, value: float}
     */
    public function totals(): array
    {
        return [
            'quantity' => (int) $this->lines->sum('quantity'),
            'delivered' => (int) $this->lines->sum('actual_qty'),
            'weight' => round((float) $this->lines->sum(
                fn (DeliveryOrderLine $line) => $line->actual_qty * $line->weight,
            ), 2),
            'value' => round((float) $this->lines->sum(
                fn (DeliveryOrderLine $line) => $line->lineTotal(),
            ), 2),
        ];
    }
}
