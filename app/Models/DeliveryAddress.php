<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_detail_id',
    'customer_name',
    'email',
    'address',
    'city',
    'state',
    'country',
    'location_type',
    'fax',
    'telephone',
])]
class DeliveryAddress extends Model
{
    protected $table = 'delivery_address';

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'company_detail_id');
    }
}
