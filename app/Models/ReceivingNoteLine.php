<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'receivenote_id',
    'afe_descs_id',
    'afe_id',
    'qty_delivered',
    'product',
    'stock_code',
    'description',
    'after_delivery_date',
    'workorder_id',
    'remarks',
])]
class ReceivingNoteLine extends Model
{
    protected $table = 'receive_note_descs';

    public $timestamps = false;

    public function receivingNote(): BelongsTo
    {
        return $this->belongsTo(ReceivingNote::class, 'receivenote_id');
    }
}
