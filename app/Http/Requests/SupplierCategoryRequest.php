<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SupplierCategoryRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'max:255'],
            'subcategory' => [
                'required',
                'string',
                'max:255',
                Rule::unique('supplier_category')->ignore($this->route('supplier_category')),
            ],
        ];
    }
}
