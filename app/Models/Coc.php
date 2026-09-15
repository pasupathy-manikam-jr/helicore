<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A certificate of conformity: the declaration that named lines of a sales
 * order were made to the standard the customer ordered against.
 */
class Coc extends Model
{
    protected $table = 'coc';

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'customer_no');
    }

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'fsdorder');
    }

    /**
     * The certificate covers named sales order lines, held as a comma
     * separated list of their ids.
     *
     * @return array<int, int>
     */
    public function lineIds(): array
    {
        return array_values(array_filter(array_map(
            'intval',
            explode(',', (string) $this->rowno),
        )));
    }

    /** @return Collection<int, SalesOrderLine> */
    public function lines(): Collection
    {
        $ids = $this->lineIds();

        if ($ids === []) {
            return SalesOrderLine::query()->whereRaw('1 = 0')->get();
        }

        return SalesOrderLine::query()
            ->whereIn('id', $ids)
            ->orderBy('item')
            ->get();
    }
}
