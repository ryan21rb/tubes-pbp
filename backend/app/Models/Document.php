<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    protected $fillable = [
        'user_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'ipfs_cid',
        // Data pengajuan
        'nama',
        'nik',
        'kategori',
        'keterangan',
        'wallet_address',
        'details',
        // Pipeline status
        'status',
        'tahap_bantuan',
        'signed_by',
        'rejected_by',
    ];

    protected $casts = [
        'signed_by'   => 'array',
        'rejected_by' => 'array',
        'details'     => 'array',
    ];

    /**
     * Get the user who uploaded the document.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the approvals for the document.
     */
    public function approvals()
    {
        return $this->hasMany(DocumentApproval::class);
    }
}
