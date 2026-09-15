<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderLine extends Model
{
    protected $table = 'stockorder_lineitem';

    public $timestamps = false;

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'orderno');
    }
}
