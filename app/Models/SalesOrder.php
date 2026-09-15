<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'customer_no',
    'delivery_address',
    'contact_person',
    'email',
    'customer_order',
    'receiving_note',
    'sales_person',
    'contract_reviewed_by',
    'order_process_by',
    'currency',
    'mode_of_shipment',
    'packaging_type',
    'certification',
    'sst',
    'is_cod',
    'customer_reqdate',
    'required_datetime',
    'goods_ready_date',
    'despatch_date',
    'packorder_date',
    'closing_date',
    'quote_basis',
    'delivery',
    'bid_validity',
    'pay_terms',
    'afe',
    'freightcharge',
    'freight',
    'packcost',
    'custom',
    'miscellaneous',
    'miscvalue',
    'discount',
    'sp_instruct1',
    'sp_instruct2',
    'sp_instruct3',
    'remarks',
])]
class SalesOrder extends Model
{
    protected $table = 'sales_orders';

    public function lines(): HasMany
    {
        return $this->hasMany(SalesOrderLine::class, 'fsdorder')->orderBy('item');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'customer_no');
    }

    public function deliveryAddress(): BelongsTo
    {
        return $this->belongsTo(DeliveryAddress::class, 'delivery_address');
    }

    public function salesperson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sales_person');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'contract_reviewed_by');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'order_process_by');
    }

    public function currencyRef(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency');
    }

    /**
     * Money on a sales order. Unlike a quotation, the discount here is an
     * amount rather than a percentage, and it comes off after the charges.
     *
     * @return array{
     *     quantity: int, weight: float, sst: float, subtotal: float,
     *     freight: float, packing: float, customs: float, misc: float,
     *     discount: float, grand_total: float
     * }
     */
    public function totals(): array
    {
        $lines = $this->lines;
        $charged = (bool) $this->sst;

        $subtotal = (float) $lines->sum(fn (SalesOrderLine $line) => $line->lineTotal($charged));

        $freight = (float) $this->freightcharge;
        $packing = (float) $this->packcost;
        $customs = (float) $this->custom;
        $misc = (float) $this->miscvalue;
        $discount = (float) $this->discount;

        return [
            'quantity' => (int) $lines->sum('quantity'),
            'weight' => round((float) $lines->sum(fn (SalesOrderLine $line) => $line->quantity * $line->weight), 2),
            'sst' => round($charged ? (float) $lines->sum('sst') : 0, 2),
            'subtotal' => round($subtotal, 2),
            'freight' => $freight,
            'packing' => $packing,
            'customs' => $customs,
            'misc' => $misc,
            'discount' => $discount,
            'grand_total' => round($subtotal + $freight + $packing + $customs + $misc - $discount, 2),
        ];
    }
}
