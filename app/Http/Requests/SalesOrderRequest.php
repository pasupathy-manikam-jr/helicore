<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalesOrderRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_no' => ['required', 'integer', 'exists:company_details,id'],
            'delivery_address' => ['nullable', 'integer', 'exists:delivery_address,id'],
            'contact_person' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'string', 'max:100'],
            'customer_order' => ['nullable', 'string', 'max:100'],
            'receiving_note' => ['required', 'string', 'max:500'],
            'sales_person' => ['required', 'integer', 'exists:users,id'],
            'contract_reviewed_by' => ['nullable', 'integer', 'exists:users,id'],
            'order_process_by' => ['required', 'integer', 'exists:users,id'],
            'currency' => ['required', 'integer', 'exists:currency,id'],
            'mode_of_shipment' => ['required', 'string', 'max:100'],
            'packaging_type' => ['nullable', 'string', 'max:20'],
            'certification' => ['nullable', 'string', 'max:100'],
            'sst' => ['required', Rule::in(['0', '1'])],
            'is_cod' => ['required', Rule::in(['0', '1'])],
            'customer_reqdate' => ['nullable', 'string', 'max:255'],
            'required_datetime' => ['nullable', 'date'],
            'goods_ready_date' => ['nullable', 'date'],
            'despatch_date' => ['nullable', 'date'],
            'packorder_date' => ['nullable', 'date'],
            'closing_date' => ['nullable', 'date'],
            'quote_basis' => ['nullable', 'string', 'max:100'],
            'delivery' => ['nullable', 'string', 'max:100'],
            'bid_validity' => ['nullable', 'string', 'max:100'],
            'pay_terms' => ['nullable', 'string', 'max:100'],
            'afe' => ['nullable', 'string', 'max:100'],
            // Charges. The legacy rules said min:0.01, which rejected a plain
            // zero; nothing here should refuse "no charge".
            'freightcharge' => ['nullable', 'numeric', 'min:0'],
            'packcost' => ['nullable', 'numeric', 'min:0'],
            'custom' => ['nullable', 'numeric', 'min:0'],
            'miscellaneous' => ['nullable', 'string', 'max:100'],
            'miscvalue' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'sp_instruct1' => ['nullable', 'string', 'max:100'],
            'sp_instruct2' => ['nullable', 'string', 'max:100'],
            'sp_instruct3' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function salesOrderAttributes(): array
    {
        $data = $this->validated();

        foreach (['freightcharge', 'packcost', 'custom', 'miscvalue', 'discount'] as $money) {
            $data[$money] = $data[$money] ?? 0;
        }

        // The legacy table keeps the freight charge in two columns.
        $data['freight'] = (string) $data['freightcharge'];

        return $data;
    }
}
