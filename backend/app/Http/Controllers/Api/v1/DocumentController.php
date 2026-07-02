<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    /**
     * List all documents (pengajuan bantuan) — untuk Instansi & Yayasan.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::with(['user', 'approvals'])->latest();

        if ($request->has('status')) {
            $query->where('status', strtolower($request->query('status')));
        }

        $documents = $query->get()
            ->map(function ($doc) {
                $allApprovals = $doc->approvals->map(function($a) {
                    return [
                        'wallet_address' => $a->node_wallet_address,
                        'status' => $a->status
                    ];
                })->toArray();
                return [
                    'id'              => $doc->id,
                    'nama'            => $doc->nama,
                    'nik'             => $doc->nik,
                    'kategori'        => $doc->kategori,
                    'keterangan'      => $doc->keterangan,
                    'wallet_address'  => $doc->wallet_address,
                    'status'          => $doc->status,
                    'tahap_bantuan'   => $doc->tahap_bantuan,
                    'signed_by'       => $doc->signed_by ?? [],
                    'rejected_by'     => $doc->rejected_by ?? [],
                    'approvals'       => $allApprovals,
                    'total_responses' => count($allApprovals),
                    'ipfs_cid'        => $doc->ipfs_cid,
                    'file_name'       => $doc->file_name,
                    'created_at'      => $doc->created_at,
                    'user'            => $doc->user ? ['name' => $doc->user->name, 'role' => $doc->user->role] : null,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data'   => $documents,
        ]);
    }

    /**
     * Update status pengajuan (TTD / tolak) oleh Instansi.
     * PATCH /api/v1/documents/{id}/status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'action'    => 'required|in:sign,reject',
            'node_name' => 'required|string|max:100',
        ]);

        $signedBy   = $document->signed_by   ?? [];
        $rejectedBy = $document->rejected_by ?? [];
        $nodeName   = $validated['node_name'];

        if ($validated['action'] === 'sign') {
            // Tambahkan node ke signed_by jika belum ada
            if (!in_array($nodeName, $signedBy)) {
                $signedBy[] = $nodeName;
            }
            // Hapus dari rejected jika sebelumnya menolak
            $rejectedBy = array_values(array_filter($rejectedBy, fn($n) => $n !== $nodeName));

            // Jika 4 node sudah TTD → disetujui
            $newStatus     = count($signedBy) >= 4 ? 'disetujui' : $document->status;
            $tahapBantuan  = count($signedBy) >= 4 ? 'Otentikasi Yayasan' : $document->tahap_bantuan;
        } else {
            // Tambahkan ke rejected_by
            if (!in_array($nodeName, $rejectedBy)) {
                $rejectedBy[] = $nodeName;
            }
            $signedBy = array_values(array_filter($signedBy, fn($n) => $n !== $nodeName));

            // Jika 2 node menolak → ditolak permanen
            $newStatus    = count($rejectedBy) >= 2 ? 'ditolak' : $document->status;
            $tahapBantuan = $document->tahap_bantuan;
        }

        $document->update([
            'signed_by'    => $signedBy,
            'rejected_by'  => $rejectedBy,
            'status'       => $newStatus,
            'tahap_bantuan' => $tahapBantuan,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Status pengajuan berhasil diperbarui.',
            'data'    => [
                'id'            => $document->id,
                'status'        => $document->status,
                'tahap_bantuan' => $document->tahap_bantuan,
                'signed_by'     => $document->signed_by,
                'rejected_by'   => $document->rejected_by,
            ],
        ]);
    }

    /**
     * Berikan persetujuan atau penolakan menggunakan Rantai Kuorum (wallet-based).
     * POST /api/v1/documents/{id}/vote
     */
    public function vote(Request $request, $id): JsonResponse
    {
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'wallet_address' => 'required|string|max:100',
            'vote_status' => 'required|in:approved,rejected'
        ]);

        $walletLower = strtolower($validated['wallet_address']);

        // Pastikan belum pernah disetujui/ditolak oleh node ini
        $existing = \App\Models\DocumentApproval::where('document_id', $document->id)
            ->where('node_wallet_address', $walletLower)
            ->first();

        if (!$existing) {
            \App\Models\DocumentApproval::create([
                'document_id' => $document->id,
                'node_wallet_address' => $walletLower,
                'status' => $validated['vote_status']
            ]);
        }

        // Cek total approvals
        $approvedCount = \App\Models\DocumentApproval::where('document_id', $document->id)
            ->where('status', 'approved')
            ->count();
        
        $rejectedCount = \App\Models\DocumentApproval::where('document_id', $document->id)
            ->where('status', 'rejected')
            ->count();

        // Aturan Kuorum
        // 3 Setuju = disetujui, 2 Tolak = ditolak
        if ($approvedCount >= 3 && $document->status !== 'disetujui') {
            $document->update([
                'status' => 'disetujui',
                'tahap_bantuan' => 'Otentikasi Yayasan'
            ]);
        } else if ($rejectedCount >= 2 && $document->status !== 'ditolak') {
            $document->update([
                'status' => 'ditolak',
                'tahap_bantuan' => 'Ditolak Instansi'
            ]);
        }

        $totalResponses = $approvedCount + $rejectedCount;

        return response()->json([
            'status' => 'success',
            'message' => 'Vote berhasil ditambahkan.',
            'total_responses' => $totalResponses,
        ]);
    }

    /**
     * Dapatkan status dokumen terakhir milik user yang sedang login.
     * GET /api/v1/my-document/status
     */
    public function myDocumentStatus(Request $request): JsonResponse
    {
        $document = Document::with('approvals')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->first();

        if (!$document) {
            return response()->json([
                'status' => 'not_found',
                'data' => null
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $document->id,
                'status' => $document->status,
                'tahap_bantuan' => $document->tahap_bantuan,
                'total_responses' => $document->approvals->count(),
                'created_at' => $document->created_at,
            ]
        ]);
    }

    /**
     * Upload requirements file and pin it to IPFS via Pinata.
     */
    public function upload(Request $request): JsonResponse
    {
        // 1. Find file in request
        $file = null;
        $possibleKeys = ['file', 'ktp', 'sktm', 'bukti_medis', 'document'];
        foreach ($possibleKeys as $key) {
            if ($request->hasFile($key)) {
                $file = $request->file($key);
                break;
            }
        }

        if (!$file) {
            $files = $request->allFiles();
            if (!empty($files)) {
                $file = reset($files);
            }
        }

        if (!$file) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Berkas tidak ditemukan. Silakan kirim berkas menggunakan format form-data.'
            ], 400);
        }

        // 2. Validate file (Max 2MB, JPG/PNG/PDF)
        $validator = Validator::make(['file' => $file], [
            'file' => 'required|file|max:2048|mimes:jpg,jpeg,png,pdf',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal: berkas wajib berupa JPG, PNG, atau PDF dengan ukuran maksimal 2MB.',
                'errors'  => $validator->errors()
            ], 422);
        }

        // 3. Send file to Pinata IPFS
        $jwt     = config('services.pinata.jwt');
        $cid     = null;
        $isMocked = false;

        if (!empty($jwt) && $jwt !== 'your_pinata_jwt_token_here') {
            try {
                $response = Http::withToken($jwt)
                    ->attach(
                        'file',
                        file_get_contents($file->getRealPath()),
                        $file->getClientOriginalName()
                    )
                    ->post('https://api.pinata.cloud/pinning/pinFileToIPFS');

                if ($response->successful()) {
                    $data = $response->json();
                    $cid  = $data['IpfsHash'] ?? null;
                } else {
                    Log::error('Pinata Cloud pinning failed: ' . $response->body());
                }
            } catch (\Exception $e) {
                Log::error('Pinata Cloud pinning exception: ' . $e->getMessage());
            }
        }

        // Fallback mock CID generation
        if (empty($cid)) {
            $isMocked = true;
            $hash = sha1($file->getClientOriginalName() . time());
            $cid  = 'Qm' . substr(str_replace(['+', '/', '='], '', base64_encode(hex2bin($hash))), 0, 44);
        }

        // 4. Save locally as backup and record in DB
        $localPath = $file->store('documents', 'public');

        // Ambil data teks dari form (nama, nik, kategori, dll.)
        $document = Document::create([
            'user_id'        => $request->user()?->id,
            'file_name'      => $file->getClientOriginalName(),
            'file_path'      => $localPath,
            'file_size'      => $file->getSize(),
            'mime_type'      => $file->getMimeType(),
            'ipfs_cid'       => $cid,
            // Data pengajuan dari form
            'nama'           => $request->input('nama'),
            'nik'            => $request->input('nik'),
            'kategori'       => $request->input('kategori'),
            'keterangan'     => $request->input('keterangan'),
            'wallet_address' => $request->input('wallet_address'),
            'status'         => 'menunggu',
            'tahap_bantuan'  => 'Verifikasi Instansi',
            'signed_by'      => [],
            'rejected_by'    => [],
        ]);

        return response()->json([
            'status'      => 'success',
            'message'     => $isMocked
                ? 'Berkas diunggah. CID sementara (mock) dibuat karena Pinata tidak tersedia.'
                : 'Berkas berhasil diunggah dan di-pin ke IPFS Pinata.',
            'data'        => [
                'document_id' => $document->id,
                'cid'         => $cid,
                'is_mocked'   => $isMocked,
                'file_name'   => $document->file_name,
                'file_size'   => $document->file_size,
                'status'      => $document->status,
            ],
        ], 201);
    }
}
