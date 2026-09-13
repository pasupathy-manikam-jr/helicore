<?php

namespace App\Http\Controllers\Reference;

use App\Models\Currency;

class CurrencyController extends ReferenceController
{
    protected const PERMISSION = 'currency';

    protected const LIST_PERMISSION = 'currency-list';

    protected function model(): string
    {
        return Currency::class;
    }

    protected function meta(): array
    {
        return [
            'title' => 'Currencies',
            'description' => 'Currencies quotes and orders can be raised in, with their rate against the ringgit.',
            'singular' => 'Currency',
            'basePath' => '/currency',
        ];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'name', 'label' => 'Code', 'type' => 'text', 'unique' => true, 'help' => 'Three letter code, e.g. USD.'],
            ['name' => 'myrrate', 'label' => 'Rate to MYR', 'type' => 'number'],
        ];
    }

    protected function usedBy(): array
    {
        return [
            ['afe', 'currency_id'],
            ['quote_refs', 'currency'],
            ['sales_orders', 'currency'],
            ['stock_order_transfers', 'currency'],
        ];
    }
}
