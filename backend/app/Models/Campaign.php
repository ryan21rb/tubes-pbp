<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'title', 'description', 'category', 'target_donation', 'collected_donation', 'status', 'image_url'])]
class Campaign extends Model
{
    /**
     * Get the organization/user that owns the campaign.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the comments for the campaign.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(CampaignComment::class);
    }

    /**
     * Get the financial reports for the campaign.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(CampaignReport::class);
    }
}
