<?php

namespace App\Http\Controllers\Reference;

use App\Models\Tnc;

class TncController extends ReferenceController
{
    protected const PERMISSION = 'tnc';

    protected const LIST_PERMISSION = 'tnc-list';

    protected function model(): string
    {
        return Tnc::class;
    }

    protected function meta(): array
    {
        return [
            'title' => 'Terms & conditions',
            'description' => 'Named sets of terms that can be attached to a quotation.',
            'singular' => 'Terms set',
            'basePath' => '/terms',
        ];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'unique' => true],
            ['name' => 'tnclist', 'label' => 'Terms', 'type' => 'textarea', 'help' => 'One condition per line.'],
        ];
    }

    protected function usedBy(): array
    {
        return [['quote_refs', 'tnc']];
    }
}
