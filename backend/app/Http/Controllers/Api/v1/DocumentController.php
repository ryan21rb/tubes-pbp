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
                    'details'         => $doc->details,
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
            'action'        => 'required|in:sign,reject,update_tahap',
            'node_name'     => 'required_if:action,sign,reject|string|max:100',
            'tahap_bantuan' => 'required_if:action,update_tahap|string|max:100',
        ]);

        if ($validated['action'] === 'update_tahap') {
            $updateData = [
                'tahap_bantuan' => $validated['tahap_bantuan']
            ];

            // Update status secara otomatis agar sinkron dengan stepper di frontend
            if ($validated['tahap_bantuan'] === 'Cairkan Dana') {
                $updateData['status'] = 'zkp_validated';
            } elseif ($validated['tahap_bantuan'] === 'Selesai') {
                $updateData['status'] = 'selesai';
            }

            $document->update($updateData);

            return response()->json([
                'status'  => 'success',
                'message' => 'Tahap bantuan berhasil diperbarui.',
                'document' => $document
            ]);
        }

        $signedBy   = $document->signed_by   ?? [];
        $rejectedBy = $document->rejected_by ?? [];
        $nodeName   = $validated['node_name'] ?? 'Yayasan';

        if ($validated['action'] === 'sign') {
            // Tambahkan node ke signed_by jika belum ada
            if (!in_array($nodeName, $signedBy)) {
                $signedBy[] = $nodeName;
            }
            // Hapus dari rejected jika sebelumnya menolak
            $rejectedBy = array_values(array_filter($rejectedBy, fn($n) => $n !== $nodeName));

            // Jika 3 node sudah TTD → disetujui
            $newStatus     = count($signedBy) >= 3 ? 'disetujui' : $document->status;
            $tahapBantuan  = count($signedBy) >= 3 ? 'Otentikasi Yayasan' : $document->tahap_bantuan;
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

        // Pastikan wallet yang mengirim vote terdaftar sebagai salah satu instansi validator
        $allowedWallets = [
            '0x5a584e7d505ac812e6b095f6f5885884d2615aab', // Dinsos
            '0x6bbbf41d0decdc96bd44c14b953b31b9e9ae37bb', // Disdik
            '0xab2bd36fa71777a23f87399212b782a96ee1256b', // BPBD
            '0xfa411cb3f7fbf067ba20881662dd70c01ca4fe16', // Dinkes
        ];

        if (!in_array($walletLower, $allowedWallets)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Alamat dompet Anda tidak terdaftar sebagai instansi validator yang sah.'
            ], 403);
        }

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

        // ==============================================================================
        // [RUMUS MATEMATIKA CONSENSUS RAFT - OFF-CHAIN VERIFICATION]
        // N = Total seluruh Node/Server yang aktif di jaringan
        $totalNodes = 4; // Terdiri dari: Dinas Sosial, Dinas Pendidikan, BPBD, Dinas Kesehatan
        
        // 1. Rumus Mayoritas Kuorum: Q = floor(N / 2) + 1 (Umum)
        // User meminta jika sudah 3/4 atau 4/4 disetujui baru statusnya menjadi 'disetujui'
        $minQuorum = 3;
        
        // 2. Rumus Fault Tolerance (Batas Rusak): F = floor((N - 1) / 2)
        // Jika butuh minimal 3/4 persetujuan, maka toleransi penolakan maksimal adalah 1 node.
        // Jika yang menolak >= 2 node, maka otomatis berstatus 'ditolak'.
        $maxRejectionsAllowed = 1;
        // ==============================================================================

        // Implementasi logika kuorum dengan persetujuan minimal 3/4 node
        if ($approvedCount >= $minQuorum && $document->status !== 'disetujui') {
            $document->update([
                'status' => 'disetujui',
                'tahap_bantuan' => 'Otentikasi Yayasan'
            ]);
        } else if ($rejectedCount > $maxRejectionsAllowed && $document->status !== 'ditolak') {
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
        // 1. Ambil semua file dalam request
        $uploadedFiles = [];
        $jwt = config('services.pinata.jwt');

        if (empty($request->allFiles())) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Berkas tidak ditemukan. Silakan kirim berkas menggunakan format form-data.'
            ], 400);
        }

        foreach ($request->allFiles() as $key => $file) {
            // Validasi file (maksimal 2MB, JPG/PNG/PDF)
            $validator = Validator::make(['file' => $file], [
                'file' => 'required|file|max:2048|mimes:jpg,jpeg,png,pdf',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Validasi gagal untuk berkas '$key': berkas wajib berupa JPG, PNG, atau PDF dengan ukuran maksimal 2MB.",
                    'errors'  => $validator->errors()
                ], 422);
            }

            // Upload ke Pinata / mock CID
            $cid = null;
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
                        $resData = $response->json();
                        $cid  = $resData['IpfsHash'] ?? null;
                    } else {
                        Log::error("Pinata Cloud pinning failed for $key: " . $response->body());
                    }
                } catch (\Exception $e) {
                    Log::error("Pinata Cloud pinning exception for $key: " . $e->getMessage());
                }
            }

            // Fallback mock CID generation
            if (empty($cid)) {
                $isMocked = true;
                $hash = sha1($file->getClientOriginalName() . time() . $key);
                $cid  = 'Qm' . substr(str_replace(['+', '/', '='], '', base64_encode(hex2bin($hash))), 0, 44);
            }

            // Simpan lokal
            $localPath = $file->store('documents', 'public');

            $uploadedFiles[$key] = [
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $localPath,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'ipfs_cid'  => $cid,
                'is_mocked' => $isMocked,
            ];
        }

        // 2. Kumpulkan seluruh data parameter detail kategori
        $detailFields = [
            // Kategori Ekonomi
            'noSktm', 'pendapatan', 'tanggungan',
            // Kategori Bencana Alam
            'kerugian', 'koordinat', 'tglBencana',
            // Kategori Kesehatan
            'namaRs', 'noRujukan', 'biayaMedis',
            // Kategori Pendidikan
            'kampus', 'nim', 'tunggakan',
            // Umum
            'tipe', 'programId'
        ];

        $details = [];
        foreach ($detailFields as $field) {
            if ($request->has($field)) {
                $details[$field] = $request->input($field);
            }
        }

        // Masukkan data file ke dalam details
        $details['files'] = $uploadedFiles;

        // Ambil file pertama sebagai berkas utama untuk kompatibilitas DB
        $primaryKey = array_key_first($uploadedFiles);
        $primaryFile = $uploadedFiles[$primaryKey];

        // 3. Simpan data dokumen baru
        $document = Document::create([
            'user_id'        => $request->user()?->id,
            'file_name'      => $primaryFile['file_name'],
            'file_path'      => $primaryFile['file_path'],
            'file_size'      => $primaryFile['file_size'],
            'mime_type'      => $primaryFile['mime_type'],
            'ipfs_cid'       => $primaryFile['ipfs_cid'],
            // Data pengajuan dari form
            'nama'           => $request->input('nama'),
            'nik'            => $request->input('nik'),
            'kategori'       => $request->input('kategori'),
            'keterangan'     => $request->input('keterangan'),
            'wallet_address' => $request->input('wallet_address'),
            'details'        => $details,
            'status'         => 'menunggu',
            'tahap_bantuan'  => 'Verifikasi Instansi',
            'signed_by'      => [],
            'rejected_by'    => [],
        ]);

        return response()->json([
            'status'      => 'success',
            'message'     => 'Berkas persyaratan berhasil diunggah dan direkam di database.',
            'data'        => [
                'document_id' => $document->id,
                'cid'         => $primaryFile['ipfs_cid'],
                'is_mocked'   => $primaryFile['is_mocked'],
                'file_name'   => $document->file_name,
                'file_size'   => $document->file_size,
                'status'      => $document->status,
                'details'     => $document->details,
            ],
        ], 201);
    }
}
