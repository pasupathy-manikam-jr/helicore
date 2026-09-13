<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

/**
 * The four product lines each keep their stock codes in their own table, all
 * with the same columns. One model switches between them rather than four
 * identical classes.
 */
#[Fillable(['description', 'weight', 'price'])]
class StockItem extends Model
{
    public $timestamps = false;

    /**
     * Product key => [legacy table, label shown in the UI].
     *
     * @var array<string, array{table: string, label: string}>
     */
    public const PRODUCTS = [
        'rtj' => ['table' => 'rtj_stock', 'label' => 'Ring type joint'],
        'spw' => ['table' => 'spw_stock', 'label' => 'Spiral wound'],
        'ins' => ['table' => 'ins_stock', 'label' => 'Insulation'],
        'kz' => ['table' => 'kz_stock', 'label' => 'Kroll & Ziller'],
    ];

    public static function forProduct(string $product): Builder
    {
        $item = new static;
        $item->setTable(static::tableFor($product));

        return $item->newQuery();
    }

    public static function tableFor(string $product): string
    {
        return static::PRODUCTS[$product]['table']
            ?? throw new InvalidArgumentException("Unknown product [{$product}].");
    }

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'weight' => 'decimal:2',
            'price' => 'decimal:2',
        ];
    }
}
