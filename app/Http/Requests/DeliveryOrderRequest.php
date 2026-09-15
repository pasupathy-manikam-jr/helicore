<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeliveryOrderRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['salesorder', 'workorder', 'stockordertransfer'])],
            'order' => ['required', 'integer'],
            'customer_order' => ['nullable', 'string', 'max:50'],
            // The ticked lines. What goes out is whatever is still outstanding
            // on each, worked out on the server.
            'lines' => ['required', 'array', 'min:1'],
            'lines.*' => ['integer'],
        ];
    }
}
