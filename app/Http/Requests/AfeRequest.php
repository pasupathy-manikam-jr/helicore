<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AfeRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'potype' => ['required', 'string', 'max:10'],
            'supplier_id' => ['required', 'integer', 'exists:supplier,id'],
            'supplier_category_id' => ['required', 'string', 'max:30'],
            'suppquoteno' => ['required', 'string', 'max:50'],
            'currency_id' => ['required', 'integer', 'exists:currency,id'],
            'originator' => ['required', 'string', 'max:255'],
            'salesorder' => ['nullable', 'string', 'max:255'],
            'buyingfrom' => ['nullable', 'string', 'max:500'],
            'eta' => ['nullable', 'string', 'max:100'],
            'payment_terms' => ['nullable', 'string', 'max:255'],
            'terms' => ['nullable', 'string', 'max:300'],
            'comments' => ['nullable', 'string'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'max:10240', 'mimes:jpeg,jpg,png,pdf,txt,doc,docx,xls,xlsx'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function afeAttributes(): array
    {
        return $this->safe()->except('attachments');
    }
}
