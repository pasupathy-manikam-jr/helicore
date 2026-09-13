<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockItemRequest extends FormRequest
{
    /**
     * Stock levels are not editable here: they come from stock orders and
     * delivery orders, the same as in the legacy screen.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'description' => ['nullable', 'string', 'max:1000'],
            'weight' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
        ];
    }
}
