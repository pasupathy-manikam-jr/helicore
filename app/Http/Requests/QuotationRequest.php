<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuotationRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'company_details_id' => ['required', 'integer', 'exists:company_details,id'],
            'attnto' => ['required', 'string', 'max:255'],
            'clientemail' => ['required', 'string', 'max:255'],
            'client_buyer_name' => ['nullable', 'string', 'max:50'],
            'your_ref' => ['required', 'string', 'max:100'],
            'rfq' => ['nullable', 'string', 'max:50'],
            'revno' => ['required', 'integer', 'min:0'],
            'sst' => ['required', Rule::in(['0', '1'])],
            // The salesperson the quotation is issued by, and the user raising it.
            'issuermail' => ['required', 'integer', 'exists:users,id'],
            'user_email' => ['required', 'integer', 'exists:users,id'],
            'currency' => ['required', 'integer', 'exists:currency,id'],
            'tnc' => ['nullable', 'integer', 'exists:tnc,id'],
            'quote_basis' => ['nullable', 'string', 'max:100'],
            'delivery' => ['nullable', 'string', 'max:100'],
            'bid_valid' => ['nullable', 'string', 'max:100'],
            'pay_terms' => ['nullable', 'string', 'max:100'],
            'tender_close_date' => ['nullable', 'date'],
            'packcost' => ['nullable', 'numeric', 'min:0'],
            'custom' => ['nullable', 'numeric', 'min:0'],
            'misc' => ['nullable', 'string', 'max:100'],
            'miscvalue' => ['nullable', 'numeric', 'min:0'],
            'freight' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'max:10240', 'mimes:jpeg,jpg,png,pdf,txt,doc,docx,xls,xlsx'],
        ];
    }

    /**
     * Money columns are nullable in the legacy schema but the totals treat a
     * blank as zero, so store zero rather than null.
     *
     * @return array<string, mixed>
     */
    public function quotationAttributes(): array
    {
        $data = $this->safe()->except('attachments');

        foreach (['packcost', 'custom', 'miscvalue', 'freight', 'discount'] as $money) {
            $data[$money] = $data[$money] ?? 0;
        }

        return $data;
    }
}
