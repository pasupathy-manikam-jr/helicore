<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product',
    'stockcode',
    'std_stockcode',
    'description',
    'unit',
    'weight',
    'qty',
    'cost_price',
    'shipping_cost',
    'mark_up',
    'import_duty',
    'pomaterialcode',
    'our_ref',
    'item',
])]
class QuotationLine extends Model
{
    protected $table = 'quote_descs';

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class, 'our_ref');
    }

    /**
     * What this line comes to. Derived rather than read from the stored total
     * because rows written before the current pricing code folded SST into
     * that column, which would double count it once SST is added on top.
     */
    public function lineTotal(bool $chargesSst): float
    {
        return round(
            (float) $this->qty * (float) $this->price + ($chargesSst ? (float) $this->sst : 0),
            2,
        );
    }

    /**
     * Works the cost up into a unit price the way the legacy screen does:
     * shipping, then mark up, then import duty, each a percentage applied to
     * the running total rather than to the bare cost.
     *
     * @param  float  $sstRate  SST percentage, charged only when the quotation opts in.
     * @param  float  $myrRate  The quotation currency's rate to MYR.
     */
    public function applyPricing(float $sstRate, float $myrRate, bool $chargesSst): void
    {
        $unit = (float) $this->cost_price;
        $unit += $unit * (float) $this->shipping_cost / 100;
        $unit += $unit * (float) $this->mark_up / 100;
        $unit += $unit * (float) $this->import_duty / 100;

        $qty = (int) $this->qty;

        $this->price = round($unit, 2);
        $this->total = round($unit * $qty, 2);
        $this->sst = $chargesSst ? round($unit * $qty * $sstRate / 100, 2) : 0;
        $this->totalmyr = $myrRate * $unit * $qty;
    }
}
