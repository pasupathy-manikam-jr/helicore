<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Work raised to make stock, usually against a sales order. The legacy table
 * is stock_orders; the screens call it a work order.
 */
class WorkOrder extends Model
{
    protected $table = 'stock_orders';

    public function lines(): HasMany
    {
        return $this->hasMany(WorkOrderLine::class, 'orderno')->orderBy('item');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'customer_no');
    }

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'salesorder');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'order_process_by');
    }

    /**
     * @return array{quantity: int, weight: float, value: float}
     */
    public function totals(): array
    {
        return [
            'quantity' => (int) $this->lines->sum('quantity'),
            'weight' => round((float) $this->lines->sum(
                fn (WorkOrderLine $line) => $line->quantity * $line->weight,
            ), 2),
            'value' => round((float) $this->lines->sum(
                fn (WorkOrderLine $line) => $line->quantity * $line->unit_price,
            ), 2),
        ];
    }
}
