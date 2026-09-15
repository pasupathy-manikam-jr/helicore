<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

/**
 * How much of each stock code went out, by month, for one year. Each product
 * line keeps its own table, all with the same columns.
 */
class StockSold extends Model
{
    public $timestamps = false;

    /**
     * Product key => [legacy table, label shown in the UI]. The legacy screen
     * also offered `nstd`, which has no table.
     *
     * @var array<string, array{table: string, label: string}>
     */
    public const PRODUCTS = [
        'rtj' => ['table' => 'rtj_stocksold', 'label' => 'Ring type joint'],
        'spw' => ['table' => 'spw_stocksold', 'label' => 'Spiral wound'],
        'scg' => ['table' => 'scg_stocksold', 'label' => 'Flat ring'],
        'ins' => ['table' => 'ins_stocksold', 'label' => 'Insulation'],
        'djg' => ['table' => 'djg_stocksold', 'label' => 'Double jacketed'],
        'cam' => ['table' => 'cam_stocksold', 'label' => 'Cam profile'],
        'kz' => ['table' => 'kz_stocksold', 'label' => 'Kroll & Ziller'],
    ];

    /** The month columns, in order. December is `decb` in the legacy schema. */
    public const MONTHS = [
        'jan' => 'Jan', 'feb' => 'Feb', 'mar' => 'Mar', 'apr' => 'Apr',
        'may' => 'May', 'jun' => 'Jun', 'jul' => 'Jul', 'aug' => 'Aug',
        'sept' => 'Sep', 'oct' => 'Oct', 'nov' => 'Nov', 'decb' => 'Dec',
    ];

    public static function forProduct(string $product): Builder
    {
        $row = new static;
        $row->setTable(static::PRODUCTS[$product]['table']
            ?? throw new InvalidArgumentException("Unknown product [{$product}]."));

        return $row->newQuery();
    }

    /** Total sold across the year. */
    public function yearTotal(): int
    {
        $total = 0;

        foreach (array_keys(static::MONTHS) as $month) {
            $total += (int) $this->{$month};
        }

        return $total;
    }

    /**
     * The column holds the invoice, delivery order and date for each despatch
     * as one comma separated string.
     *
     * @return array<int, string>
     */
    public function despatches(): array
    {
        return array_values(array_filter(array_map(
            'trim',
            explode(',', (string) $this->invoice_do_date),
        )));
    }
}
