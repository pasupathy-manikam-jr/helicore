<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'attnto',
    'clientemail',
    'sst',
    'attachment',
    'your_ref',
    'tax',
    'packcost',
    'custom',
    'misc',
    'miscvalue',
    'freight',
    'discount',
    'company_details_id',
    'quote_basis',
    'delivery',
    'bid_valid',
    'pay_terms',
    'user_email',
    'issuermail',
    'currency',
    'revno',
    'tender_close_date',
    'client_buyer_name',
    'rfq',
    'tnc',
    'so_ref',
    'created_at',
])]
class Quotation extends Model
{
    protected $table = 'quote_refs';

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'company_details_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(QuotationLine::class, 'our_ref')->orderBy('item');
    }

    /** The salesperson the quotation is raised for. */
    public function salesperson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_email');
    }

    /** The user who issued it. */
    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issuermail');
    }

    /** Legacy column is a varchar holding the currency id. */
    public function currencyRef(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency');
    }

    public function tncRef(): BelongsTo
    {
        return $this->belongsTo(Tnc::class, 'tnc');
    }

    /**
     * Money on a quotation, in the order the legacy screen adds it up. Lines
     * carry their own SST value, charged only when the quotation opts in.
     *
     * @return array{
     *     quantity: int, weight: float, sst: float, subtotal: float,
     *     discount_percent: float, discount: float, after_discount: float,
     *     packing: float, customs: float, misc: float, freight: float,
     *     sum_of_total: float, gst_rate: float, gst: float, grand_total: float
     * }
     */
    public function totals(): array
    {
        $lines = $this->lines;
        $charged = (bool) $this->sst;

        $quantity = (int) $lines->sum('qty');
        $weight = (float) $lines->sum(fn (QuotationLine $line) => $line->qty * $line->weight);
        $sst = (float) $lines->sum('sst');

        $subtotal = (float) $lines->sum(fn (QuotationLine $line) => $line->lineTotal($charged));

        $discountPercent = (float) $this->discount;
        $discount = $subtotal * $discountPercent / 100;
        $afterDiscount = $subtotal - $discount;

        $packing = (float) $this->packcost;
        $customs = (float) $this->custom;
        $misc = (float) $this->miscvalue;
        $freight = (float) $this->freight;

        $sumOfTotal = $afterDiscount + $packing + $customs + $misc + $freight;

        // GST ran at 6% in Malaysia until it was replaced by SST on 1 June
        // 2018; quotations raised before then still show it.
        $gstRate = $this->created_at !== null && $this->created_at->lessThanOrEqualTo('2018-06-01')
            ? 0.06
            : 0.0;
        $gst = $sumOfTotal * $gstRate;

        return [
            'quantity' => $quantity,
            'weight' => round($weight, 2),
            'sst' => round($charged ? $sst : 0, 2),
            'subtotal' => round($subtotal, 2),
            'discount_percent' => $discountPercent,
            'discount' => round($discount, 2),
            'after_discount' => round($afterDiscount, 2),
            'packing' => $packing,
            'customs' => $customs,
            'misc' => $misc,
            'freight' => $freight,
            'sum_of_total' => round($sumOfTotal, 2),
            'gst_rate' => $gstRate,
            'gst' => round($gst, 2),
            'grand_total' => round($sumOfTotal + $gst, 2),
        ];
    }

    /** @return array<int, string> */
    public function attachments(): array
    {
        return array_values(array_filter(explode(',', (string) $this->attachment)));
    }
}
