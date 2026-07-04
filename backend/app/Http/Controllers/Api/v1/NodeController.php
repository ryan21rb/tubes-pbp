<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Node;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NodeController extends Controller
{
    /**
     * Daftar wallet VIP (5 entitas).
     * Semua alamat dalam format lowercase untuk komparasi case-insensitive.
     */
    private array $vipNodes = [
        'dinas sosial' => '0x5a584e7d505ac812e6b095f6f5885884d2615aab',
        'dinas pendidikan' => '0x6bbbf41d0decdc96bd44c14b953b31b9e9ae37bb',
        'bpbd' => '0xab2bd36fa71777a23f87399212b782a96ee1256b',
        'dinas kesehatan' => '0xfa411cb3f7fbf067ba20881662dd70c01ca4fe16',
        'yayasan ruang peduli bersama' => '0x507610fdf65637c1752657664dfea2865e589b88',
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

        // Cari nama node berdasarkan wallet address
        $nodeName = null;
        foreach ($this->vipNodes as $name => $address) {
            if ($address === $walletLower) {
                $nodeName = ucwords($name);
                break;
            }
        }

        // Jika bukan VIP, abaikan
        if (!$nodeName) {
            return response()->json(['status' => 'success', 'message' => 'Not a VIP node, ignored']);
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
        $nodes = Node::whereIn('wallet_address', array_values($this->vipNodes))->get()->keyBy('wallet_address');
        
        $statusList = [];

        foreach ($this->vipNodes as $name => $address) {
            $node = $nodes->get($address);
            $isActive = false;
            $lastSeenText = "Belum pernah aktif";

            if ($node && $node->last_seen) {
                // Aktif jika ping kurang dari 1 menit (60 detik) yang lalu
                $diffInSeconds = Carbon::now()->diffInSeconds($node->last_seen);
                
                if ($diffInSeconds < 60) {
                    $isActive = true;
                    $lastSeenText = "Online";
                } else {
                    $diffInMinutes = Carbon::now()->diffInMinutes($node->last_seen);
                    
                    if ($diffInMinutes < 60) {
                        $lastSeenText = "Terakhir $diffInMinutes menit lalu";
                    } elseif ($diffInMinutes < 1440) {
                        $hours = floor($diffInMinutes / 60);
                        $lastSeenText = "Terakhir $hours jam lalu";
                    } else {
                        $days = floor($diffInMinutes / 1440);
                        $lastSeenText = "Terakhir $days hari lalu";
                    }
                }
            }

            // ==============================================================================
            // [RUMUS RAFT - RANDOMIZED ELECTION TIMEOUT]
            // T_timeout dalam interval [T_min, T_max] di mana T_min = 150ms dan T_max = 300ms.
            // Digunakan oleh node pengikut (follower) untuk menentukan kapan mereka harus 
            // menaikkan status menjadi kandidat (candidate) jika tidak menerima heartbeat dari leader.
            // Setiap node menghasilkan waktu tunggu secara acak untuk mencegah bentrok suara.
            $electionTimeoutMs = rand(150, 300);
            // ==============================================================================

            $statusList[] = [
                'name' => ucwords($name),
                'wallet_address' => $address,
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
