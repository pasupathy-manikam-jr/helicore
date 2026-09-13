<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuotationLineRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product' => ['required', 'string', 'max:255'],
            'stockcode' => ['required', 'string', 'max:255'],
            'std_stockcode' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'unit' => ['required', Rule::in(['Unit', 'Lot', 'Meter'])],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'qty' => ['required', 'integer', 'min:1'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            // Percentages worked onto the cost, in this order.
            'shipping_cost' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'mark_up' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'import_duty' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'pomaterialcode' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function lineAttributes(): array
    {
        $data = $this->validated();

        foreach (['weight', 'shipping_cost', 'mark_up', 'import_duty'] as $optional) {
            $data[$optional] = $data[$optional] ?? 0;
        }

        return $data;
    }
}
