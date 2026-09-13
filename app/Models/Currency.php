<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'myrrate'])]
class Currency extends Model
{
    protected $table = 'currency';

    public $timestamps = false;
}
