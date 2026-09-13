<?php

namespace App\Http\Controllers\Reference;

use App\Models\Tax;

class TaxController extends ReferenceController
{
    protected const PERMISSION = 'tax';

    /** The legacy permission set spells this one `tax-index`. */
    protected const LIST_PERMISSION = 'tax-index';

    protected function model(): string
    {
        return Tax::class;
    }

    protected function meta(): array
    {
        return [
            'title' => 'Tax rates',
            'description' => 'SST and GST rates applied to quotes, orders and invoices.',
            'singular' => 'Tax rate',
            'basePath' => '/tax',
        ];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'unique' => true],
            ['name' => 'value', 'label' => 'Rate %', 'type' => 'number'],
        ];
    }
}
