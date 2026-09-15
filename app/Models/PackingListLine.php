<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackingListLine extends Model
{
    protected $table = 'packinglist_content';

    public $timestamps = false;

    public function packingList(): BelongsTo
    {
        return $this->belongsTo(PackingList::class, 'packingid');
    }

    public function deliveryOrder(): BelongsTo
    {
        return $this->belongsTo(DeliveryOrder::class, 'do_id');
    }
}
