<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** What actually arrived against an AFE. */
#[Fillable([
    'afe_id',
    'supplierinvoice',
    'deliverydate',
    'awb',
    'osc',
    'user',
    'preparedate',
    'remarks',
])]
class ReceivingNote extends Model
{
    protected $table = 'receivenote';

    public function lines(): HasMany
    {
        return $this->hasMany(ReceivingNoteLine::class, 'receivenote_id');
    }

    public function afe(): BelongsTo
    {
        return $this->belongsTo(Afe::class, 'afe_id');
    }
}
