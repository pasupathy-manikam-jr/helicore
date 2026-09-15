<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProformaRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'sales_order' => ['required', 'integer', 'exists:sales_orders,id'],
            'paymentdue' => ['nullable', 'string', 'max:100'],
            'misc_title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
