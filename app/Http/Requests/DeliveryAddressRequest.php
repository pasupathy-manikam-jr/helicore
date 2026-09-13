<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeliveryAddressRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'company_detail_id' => ['required', 'integer', 'exists:company_details,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'location_type' => ['required', 'string', 'max:6'],
            'fax' => ['nullable', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:200'],
        ];
    }
}
