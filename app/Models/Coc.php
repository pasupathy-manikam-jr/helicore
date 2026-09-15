<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A certificate of conformity: the declaration that named lines of a sales
 * order were made to the standard the customer ordered against.
 */
#[Fillable([
    'fsdorder',
    'indexno',
    'customer_no',
    'quality_auth',
    'rowno',
    'remarks',
])]
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

    /** The despatch whose lines the certificate covers. */
    public function deliveryOrder(): BelongsTo
    {
        return $this->belongsTo(DeliveryOrder::class, 'indexno');
    }

    /**
     * The certificate covers named despatch lines, held as a comma separated
     * list of their ids.
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

    /** @return Collection<int, DeliveryOrderLine> */
    public function lines(): Collection
    {
        $ids = $this->lineIds();

        if ($ids === []) {
            return DeliveryOrderLine::query()->whereRaw('1 = 0')->get();
        }

        return DeliveryOrderLine::query()
            ->whereIn('id', $ids)
            ->orderBy('item')
            ->get();
    }
}
