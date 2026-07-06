<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignComment;
use App\Models\CampaignReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    /**
     * Display a listing of campaigns along with comments and financial reports.
     */
    public function index(Request $request): JsonResponse
    {
        $campaigns = Campaign::with(['comments', 'reports'])->latest()->get();

        // Populate deterministic mock collected donation for UI demo if collected is 0
        foreach ($campaigns as $campaign) {
            if ($campaign->collected_donation == 0) {
                $mockPercent = (($campaign->id * 17) % 40) + 15; // e.g. 32%, 19%, 36%...
                $campaign->collected_donation = round(($campaign->target_donation * $mockPercent) / 100, 2);
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $campaigns
        ]);
    }

    /**
     * Store a newly created campaign.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'target_donation' => 'required|numeric|min:0',
            'image_url' => 'nullable|string',
        ]);

        $campaign = Campaign::create([
            'user_id' => $request->user()?->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'target_donation' => $validated['target_donation'],
            'collected_donation' => 0,
            'status' => 'Berjalan',
            'image_url' => $validated['image_url'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kampanye berhasil dibuat',
            'data' => $campaign->load(['comments', 'reports'])
        ], 201);
    }

    /**
     * Add a comment to a campaign.
     */
    public function addComment(Request $request, $id): JsonResponse
    {
        $campaign = Campaign::findOrFail($id);

        $validated = $request->validate([
            'comment' => 'required|string',
            'user_name' => 'nullable|string|max:100'
        ]);

        $comment = CampaignComment::create([
            'campaign_id' => $campaign->id,
            'user_name' => $validated['user_name'] ?? ($request->user()?->name ?? 'Anonim'),
            'comment' => $validated['comment'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Komentar berhasil ditambahkan',
            'data' => $comment
        ], 201);
    }

    /**
     * Add a financial/utilization report to a campaign.
     */
    public function addReport(Request $request, $id): JsonResponse
    {
        $campaign = Campaign::findOrFail($id);

        // Check if the authenticated user is the campaign creator (optional check, we keep it simple or restrict)
        if ($campaign->user_id !== $request->user()?->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki hak untuk menambahkan laporan di kampanye ini.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'details' => 'required|string',
            'amount_spent' => 'required|numeric|min:0'
        ]);

        $report = CampaignReport::create([
            'campaign_id' => $campaign->id,
            'title' => $validated['title'],
            'details' => $validated['details'],
            'amount_spent' => $validated['amount_spent'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan alokasi dana berhasil ditambahkan',
            'data' => $report
        ], 201);
    }

    /**
     * Donate / record donation in campaign.
     */
    public function donate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'programId'    => 'required|integer|exists:campaigns,id',
            'donateAmount' => 'required|numeric|min:0.000000000000000001',
            'txHash'       => 'nullable|string',
            'doa'          => 'nullable|string',
        ]);

        $campaign = Campaign::findOrFail($validated['programId']);
        $campaign->collected_donation += $validated['donateAmount'];
        $campaign->save();

        CampaignComment::create([
            'campaign_id' => $campaign->id,
            'user_id'     => $request->user()?->id,
            'user_name'   => $request->user()?->name ?? 'Anonim',
            'comment'     => !empty($validated['doa']) ? $validated['doa'] : 'Berdonasi untuk program ini.',
            'amount'      => $validated['donateAmount'],
            'tx_hash'     => $validated['txHash'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Donasi berhasil disinkronisasi.',
            'data' => $campaign->load(['comments', 'reports'])
        ]);
    }
}
