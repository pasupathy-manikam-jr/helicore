<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClientRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'cname' => ['required', 'string', 'max:255'],
            'regno' => ['required', 'string', 'max:100'],
            'gst_regno' => ['nullable', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'fax' => ['nullable', 'string', 'max:255'],
            'attn' => ['required', 'string', 'max:255'],
            'client_email' => ['required', 'email', 'max:255'],
            // Holds the salesperson's user id. Legacy rows hold a username
            // instead, so the column stays a plain string.
            'user_email' => ['required', 'integer', 'exists:users,id'],
            'cstatus' => ['required', Rule::in(['PLC', 'NON-PLC'])],
            'payment_terms' => ['required', 'string', 'max:255'],
            'status' => ['required', Rule::in(['Active', 'Obsolete'])],
        ];
    }
}
