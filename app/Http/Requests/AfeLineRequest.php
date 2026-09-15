<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AfeLineRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product' => ['nullable', 'string', 'max:255'],
            'stock_code' => ['nullable', 'string', 'max:100'],
            'description' => ['required', 'string'],
            'qty' => ['required', 'integer', 'min:1'],
            'unitvalue' => ['required', 'numeric', 'min:0'],
        ];
    }
}
