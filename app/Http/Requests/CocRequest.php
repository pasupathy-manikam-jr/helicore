<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CocRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'delivery_order' => ['required', 'integer', 'exists:loading_note,id'],
            'quality_auth' => ['required', 'string', 'max:100'],
            'remarks' => ['nullable', 'string'],
            // The despatch lines the certificate covers.
            'lines' => ['required', 'array', 'min:1'],
            'lines.*' => ['integer'],
        ];
    }
}
