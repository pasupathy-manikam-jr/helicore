<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'do_id',
    'item',
    'poitem',
    'quantity',
    'actual_qty',
    'product',
    'description',
    'postock_code',
    'stockcode',
    'std_stockcode',
    'unit_price',
    'weight',
    'sst',
])]
class DeliveryOrderLine extends Model
{
    protected $table = 'loading_note_content';

    public $timestamps = false;

    public function deliveryOrder(): BelongsTo
    {
        return $this->belongsTo(DeliveryOrder::class, 'do_id');
    }

    /** What actually went out, at the price the line was sold at. */
    public function lineTotal(): float
    {
        return round((float) $this->actual_qty * (float) $this->unit_price, 2);
    }
}
