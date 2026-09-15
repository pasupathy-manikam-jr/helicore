<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReceivingNoteRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'afe_id' => ['required', 'integer', 'exists:afe,id'],
            'supplierinvoice' => ['nullable', 'string', 'max:200'],
            'deliverydate' => ['nullable', 'date'],
            'awb' => ['nullable', 'string', 'max:50'],
            'osc' => ['nullable', 'string', 'max:50'],
            'remarks' => ['nullable', 'string'],
            // Keyed by AFE line id. Lines left blank are simply not received.
            'quantities' => ['required', 'array', 'min:1'],
            'quantities.*' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    /**
     * The AFE lines that actually had a quantity entered against them.
     *
     * @return array<int, float>
     */
    public function receivedQuantities(): array
    {
        return collect($this->validated('quantities'))
            ->map(fn ($quantity) => (float) $quantity)
            ->filter(fn (float $quantity) => $quantity > 0)
            ->all();
    }
}
