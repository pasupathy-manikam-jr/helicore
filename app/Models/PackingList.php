<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PackingList extends Model
{
    protected $table = 'packinglist';

    public function lines(): HasMany
    {
        return $this->hasMany(PackingListLine::class, 'packingid')->orderBy('item');
    }

    /**
     * One packing list can cover several sales orders, held as a comma
     * separated list of their ids.
     *
     * @return array<int, int>
     */
    public function salesOrderIds(): array
    {
        return array_values(array_filter(array_map(
            'intval',
            explode(',', (string) $this->fsdorder),
        )));
    }

    /**
     * @return array{items: int, weight: float, value: float}
     */
    public function totals(): array
    {
        return [
            'items' => $this->lines->count(),
            'weight' => round((float) $this->lines->sum('unit_weight'), 2),
            'value' => round((float) $this->lines->sum('unit_value'), 2),
        ];
    }
}
