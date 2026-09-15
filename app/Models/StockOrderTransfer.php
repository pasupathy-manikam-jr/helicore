<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Stock moved to fill a sales order from somewhere other than production. */
class StockOrderTransfer extends Model
{
    protected $table = 'stock_order_transfers';

    public function lines(): HasMany
    {
        return $this->hasMany(StockOrderTransferLine::class, 'orderno')->orderBy('item');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'customer_no');
    }

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'salesorder');
    }

    public function currencyRef(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency');
    }

    /**
     * @return array{quantity: int, weight: float, subtotal: float, grand_total: float}
     */
    public function totals(): array
    {
        $subtotal = (float) $this->lines->sum(
            fn (StockOrderTransferLine $line) => $line->quantity * $line->unit_price,
        );

        return [
            'quantity' => (int) $this->lines->sum('quantity'),
            'weight' => round((float) $this->lines->sum(
                fn (StockOrderTransferLine $line) => $line->quantity * $line->weight,
            ), 2),
            'subtotal' => round($subtotal, 2),
            // Charges follow the sales order shape: a discount amount off the end.
            'grand_total' => round(
                $subtotal
                + (float) $this->freightcharge
                + (float) $this->packcost
                + (float) $this->custom
                + (float) $this->miscvalue
                - (float) $this->discount,
                2,
            ),
        ];
    }
}
