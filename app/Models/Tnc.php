<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'tnclist'])]
class Tnc extends Model
{
    protected $table = 'tnc';
}
