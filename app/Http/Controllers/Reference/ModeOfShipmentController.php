<?php

namespace App\Http\Controllers\Reference;

use App\Models\ModeOfShipment;

class ModeOfShipmentController extends ReferenceController
{
    protected const PERMISSION = 'mos';

    protected const LIST_PERMISSION = 'mos-list';

    protected function model(): string
    {
        return ModeOfShipment::class;
    }

    protected function meta(): array
    {
        return [
            'title' => 'Modes of shipment',
            'description' => 'Carriers and shipping methods offered on quotes and delivery orders.',
            'singular' => 'Mode of shipment',
            'basePath' => '/mode-of-shipment',
        ];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'mode', 'label' => 'Mode', 'type' => 'text', 'unique' => true],
        ];
    }
}
