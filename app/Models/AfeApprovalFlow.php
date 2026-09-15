<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One rung of the AFE approval ladder: who signs, for what value, at what
 * stage, and who the AFE moves to next.
 */
#[Fillable([
    'approver_id',
    'approving_limit_start',
    'approving_limit',
    'stage',
    'forwardStatus',
])]
class AfeApprovalFlow extends Model
{
    protected $table = 'afe_approval_flow';

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    /** Zero means the AFE stops here rather than moving on. */
    public function forwardTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'forwardStatus');
    }
}
