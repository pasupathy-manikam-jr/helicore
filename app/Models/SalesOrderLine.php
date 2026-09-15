<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'fsdorder',
    'item',
    'linedate',
    'polineitem',
    'quantity',
    'unit',
    'product',
    'postock_code',
    'stock_code',
    'std_stockcode',
    'weight',
    'description',
    'batch',
    'type_of_certification',
    'operator',
    'unit_price',
    'fgmr',
    'wo',
    'po',
])]
class SalesOrderLine extends Model
{
    protected $table = 'sales_order_line_item';

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'fsdorder');
    }

    /**
     * SST is charged on the line when the order opts in, at the single rate
     * the tax table holds.
     */
    public function applyPricing(float $sstRate, float $myrRate, bool $chargesSst): void
    {
        $value = (float) $this->quantity * (float) $this->unit_price;

        $this->sst = $chargesSst ? round($value * $sstRate / 100, 2) : 0;
        $this->totalmyr = round($myrRate * ($value + (float) $this->sst), 2);
    }

    public function lineTotal(bool $chargesSst): float
    {
        return round(
            (float) $this->quantity * (float) $this->unit_price + ($chargesSst ? (float) $this->sst : 0),
            2,
        );
    }
}
