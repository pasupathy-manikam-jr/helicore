<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['category', 'subcategory'])]
class SupplierCategory extends Model
{
    protected $table = 'supplier_category';

    public $timestamps = false;
}
