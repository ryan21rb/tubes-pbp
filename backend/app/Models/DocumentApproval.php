<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentApproval extends Model
{
    protected $fillable = [
        'document_id',
        'node_wallet_address',
        'status',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
