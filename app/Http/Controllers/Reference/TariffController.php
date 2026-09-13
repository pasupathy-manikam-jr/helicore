<?php

namespace App\Http\Controllers\Reference;

use App\Models\Tariff;

class TariffController extends ReferenceController
{
    protected const PERMISSION = 'tariff';

    protected const LIST_PERMISSION = 'tariff-list';

    protected function model(): string
    {
        return Tariff::class;
    }

    protected function meta(): array
    {
        return [
            'title' => 'Tariff codes',
            'description' => 'Customs tariff headings applied to shipped goods.',
            'singular' => 'Tariff code',
            'basePath' => '/tariff',
        ];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'name', 'label' => 'Description', 'type' => 'text'],
            ['name' => 'code', 'label' => 'Code', 'type' => 'text', 'unique' => true],
        ];
    }
}
