<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AfeApprovalFlowRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'approver_id' => ['required', 'integer', 'exists:users,id'],
            'approving_limit_start' => ['required', 'numeric', 'min:0'],
            'approving_limit' => ['required', 'numeric', 'gt:approving_limit_start'],
            'stage' => ['required', 'integer', 'min:1'],
            // Zero means the AFE stops with this approver.
            'forwardStatus' => ['nullable', 'integer'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function flowAttributes(): array
    {
        $data = $this->validated();
        $data['forwardStatus'] = $data['forwardStatus'] ?? 0;

        return $data;
    }
}
