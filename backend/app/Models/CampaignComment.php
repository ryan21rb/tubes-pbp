<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['campaign_id', 'user_name', 'comment', 'user_id', 'amount', 'tx_hash'])]
class CampaignComment extends Model
{
    /**
     * Get the campaign that the comment belongs to.
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Get the user that made the comment/donation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
