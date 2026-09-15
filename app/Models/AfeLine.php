<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'afe_id',
    'item',
    'product',
    'stock_code',
    'description',
    'qty',
    'unitvalue',
])]
class AfeLine extends Model
{
    protected $table = 'afe_descs';

    public $timestamps = false;

    /** Line value in the AFE currency, and its equivalent in MYR. */
    public function applyPricing(float $myrRate): void
    {
        $this->total = round((float) $this->qty * (float) $this->unitvalue, 2);
        $this->totalmyr = round($myrRate * (float) $this->total, 2);
    }

    public function afe(): BelongsTo
    {
        return $this->belongsTo(Afe::class, 'afe_id');
    }
}
