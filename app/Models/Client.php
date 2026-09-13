<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'cname',
    'regno',
    'gst_regno',
    'address',
    'city',
    'state',
    'country',
    'phone',
    'fax',
    'attn',
    'client_email',
    'user_email',
    'cstatus',
    'payment_terms',
    'status',
])]
class Client extends Model
{
    protected $table = 'company_details';

    public function deliveryAddresses(): HasMany
    {
        return $this->hasMany(DeliveryAddress::class, 'company_detail_id');
    }
}
