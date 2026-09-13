<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['mode'])]
class ModeOfShipment extends Model
{
    protected $table = 'modeshipment';

    public $timestamps = false;
}
