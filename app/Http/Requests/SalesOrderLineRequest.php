<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SalesOrderLineRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product' => ['required', 'string', 'max:50'],
            'stock_code' => ['required', 'string', 'max:100'],
            'std_stockcode' => ['nullable', 'string', 'max:255'],
            'postock_code' => ['nullable', 'string', 'max:100'],
            'polineitem' => ['nullable', 'string', 'max:50'],
            'description' => ['required', 'string'],
            'unit' => ['required', 'string', 'max:10'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'linedate' => ['nullable', 'date'],
            'batch' => ['nullable', 'string', 'max:50'],
            'type_of_certification' => ['nullable', 'string', 'max:100'],
            'operator' => ['nullable', 'string', 'max:100'],
            'fgmr' => ['nullable', 'integer'],
            'wo' => ['nullable', 'integer'],
            'po' => ['nullable', 'integer'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function lineAttributes(): array
    {
        $data = $this->validated();
        $data['weight'] = $data['weight'] ?? 0;

        return $data;
    }
}
