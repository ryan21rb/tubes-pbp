<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Node extends Model
{
    protected $fillable = [
        'name',
        'wallet_address',
        'last_seen',
    ];

    protected $casts = [
        'last_seen' => 'datetime',
    ];
}
