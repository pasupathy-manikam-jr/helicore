<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PackingListRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'delivery_order' => ['required', 'integer', 'exists:loading_note,id'],
            'ref' => ['nullable', 'string', 'max:50'],
            'altcustomername' => ['nullable', 'string', 'max:50'],
        ];
    }
}
