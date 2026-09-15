<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockOrderTransferLine extends Model
{
    protected $table = 'stock_order_transfer_lineitems';

    public $timestamps = false;

    public function transfer(): BelongsTo
    {
        return $this->belongsTo(StockOrderTransfer::class, 'orderno');
    }
}
