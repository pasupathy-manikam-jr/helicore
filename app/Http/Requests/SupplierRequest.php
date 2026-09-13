<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SupplierRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'supplier_name' => ['required', 'string', 'max:255'],
            'approval' => ['nullable', 'string', 'max:255'],
            'supplier_category_id' => ['required', 'array', 'min:1'],
            'supplier_category_id.*' => ['integer', 'exists:supplier_category,id'],
            'approver' => ['required', 'integer', 'exists:users,id'],
            'regno' => ['required', 'string', 'max:255'],
            'gst_regno' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'contact' => ['required', 'string', 'max:255'],
            'contactperson' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * The legacy schema stores category ids as a comma separated string.
     *
     * @return array<string, mixed>
     */
    public function supplierAttributes(): array
    {
        return [
            ...$this->safe()->except('supplier_category_id'),
            'supplier_category_id' => implode(',', $this->validated('supplier_category_id')),
        ];
    }
}
