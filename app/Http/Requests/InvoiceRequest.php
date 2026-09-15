<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'delivery_order' => ['required', 'integer', 'exists:loading_note,id'],
            'paymentterms' => ['nullable', 'string', 'max:100'],
            'transportation' => ['nullable', 'numeric', 'min:0'],
            'custom' => ['nullable', 'numeric', 'min:0'],
            'packing_charge' => ['nullable', 'numeric', 'min:0'],
            'misc_title' => ['nullable', 'string', 'max:255'],
            'misc' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    /**
     * @return array<string, float>
     */
    public function charges(): array
    {
        return collect(['transportation', 'custom', 'packing_charge', 'misc', 'discount', 'tax'])
            ->mapWithKeys(fn (string $field) => [$field => (float) ($this->validated($field) ?? 0)])
            ->all();
    }
}
