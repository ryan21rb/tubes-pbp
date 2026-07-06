<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Node;
use App\Models\User;
use App\Enums\InstansiType;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NodeController extends Controller
{
    /**
     * Definisi default untuk 5 node VIP (4 Instansi + 1 Yayasan).
     * Jika tidak terdaftar di database, data fallback ini akan dipakai.
     */
    private array $nodeDefinitions = [
        'dinsos'  => ['name' => 'Dinas Sosial', 'type' => 'instansi', 'fallback_wallet' => '0x5a584e7d505ac812e6b095f6f5885884d2615aab'],
        'diknas'  => ['name' => 'Dinas Pendidikan', 'type' => 'instansi', 'fallback_wallet' => '0x6bbbf41d0decdc96bd44c14b953b31b9e9ae37bb'],
        'bpbd'    => ['name' => 'BPBD', 'type' => 'instansi', 'fallback_wallet' => '0xab2bd36fa71777a23f87399212b782a96ee1256b'],
        'dinkes'  => ['name' => 'Dinas Kesehatan', 'type' => 'instansi', 'fallback_wallet' => '0xfa411cb3f7fbf067ba20881662dd70c01ca4fe16'],
        'yayasan' => ['name' => 'Yayasan Ruang Peduli Bersama', 'type' => 'yayasan', 'fallback_wallet' => '0x507610fdf65637c1752657664dfea2865e589b88'],
    ];

    /**
     * Menerima heartbeat dari frontend.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        $walletAddress = $request->input('wallet_address');

        if (!$walletAddress) {
            return response()->json(['status' => 'error', 'message' => 'Wallet address required'], 400);
        }

        $walletLower = strtolower($walletAddress);

        // Cari user terdaftar berdasarkan wallet
        $user = User::whereRaw('LOWER(wallet_address) = ?', [$walletLower])->first();

        $nodeName = null;

        if ($user) {
            if ($user->role->value === 'yayasan' || $user->role === 'yayasan') {
                $nodeName = 'Yayasan Ruang Peduli Bersama';
            } else if ($user->instansi_type) {
                $instType = $user->instansi_type->value ?? $user->instansi_type;
                if (isset($this->nodeDefinitions[$instType])) {
                    $nodeName = $this->nodeDefinitions[$instType]['name'];
                }
            }
        }

        // Jika tidak terdaftar sebagai node valid, abaikan
        if (!$nodeName) {
            return response()->json(['status' => 'success', 'message' => 'Not a registered node, ignored']);
        }

        // Update atau buat node baru
        $node = Node::updateOrCreate(
            ['wallet_address' => $walletLower],
            ['name' => $nodeName, 'last_seen' => Carbon::now()]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Heartbeat recorded',
            'data' => $node
        ]);
    }

    /**
     * Mengembalikan status 5 node VIP.
     */
    public function status(): JsonResponse
    {
        $statusList = [];

        foreach ($this->nodeDefinitions as $key => $info) {
            // Cek apakah node terdaftar di tabel users
            if ($info['type'] === 'yayasan') {
                $registeredUser = User::where('role', 'yayasan')->first();
            } else {
                $registeredUser = User::where('instansi_type', $key)->first();
            }

            $isActive = false;
            $lastSeenText = "Belum pernah aktif";
            $walletAddress = $info['fallback_wallet'];

            // Jika user terdaftar di database, maka node otomatis aktif/online!
            if ($registeredUser) {
                $isActive = true;
                $lastSeenText = "Online";
                $walletAddress = $registeredUser->wallet_address ?? $info['fallback_wallet'];
            }

            // T_timeout untuk RAFT
            $electionTimeoutMs = rand(150, 300);

            $statusList[] = [
                'name' => $info['name'],
                'wallet_address' => strtolower($walletAddress),
                'is_active' => $isActive,
                'last_seen_text' => $lastSeenText,
                'election_timeout_ms' => $electionTimeoutMs
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $statusList
        ]);
    }
}
