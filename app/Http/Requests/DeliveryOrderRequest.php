<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeliveryOrderRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'salesorder' => ['required', 'integer', 'exists:sales_orders,id'],
            'customer_order' => ['nullable', 'string', 'max:50'],
            // Keyed by sales order line id. A blank line is not despatched.
            'quantities' => ['required', 'array', 'min:1'],
            'quantities.*' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * The sales order lines that actually had a quantity entered.
     *
     * @return array<int, int>
     */
    public function despatchedQuantities(): array
    {
        return collect($this->validated('quantities'))
            ->map(fn ($quantity) => (int) $quantity)
            ->filter(fn (int $quantity) => $quantity > 0)
            ->all();
    }
}
