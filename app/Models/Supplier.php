<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'supplier_name',
    'approval',
    'supplier_category_id',
    'approver',
    'regno',
    'gst_regno',
    'address',
    'contact',
    'contactperson',
])]
class Supplier extends Model
{
    protected $table = 'supplier';

    /**
     * The legacy schema stores the selected category ids as a comma separated
     * string, so expose them as an array for the React layer.
     *
     * @return array<int, int>
     */
    public function categoryIds(): array
    {
        return array_values(array_filter(array_map(
            'intval',
            explode(',', (string) $this->supplier_category_id),
        )));
    }

    public function approverUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver');
    }
}
