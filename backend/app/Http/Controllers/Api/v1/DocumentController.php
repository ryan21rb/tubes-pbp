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
                'status' => 'error',
                'message' => 'Berkas tidak ditemukan. Silakan kirim berkas menggunakan format form-data.'
            ], 400);
        }

        // 2. Validate file (Max 2MB, JPG/PNG/PDF)
        $validator = Validator::make(['file' => $file], [
            'file' => 'required|file|max:2048|mimes:jpg,jpeg,png,pdf',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal: berkas wajib berupa JPG, PNG, atau PDF dengan ukuran maksimal 2MB.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 3. Send file to Pinata IPFS
        $jwt = config('services.pinata.jwt');
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
                    $data = $response->json();
                    $cid = $data['IpfsHash'] ?? null;
                } else {
                    Log::error('Pinata Cloud pinning failed: ' . $response->body());
                }
            } catch (\Exception $e) {
                Log::error('Pinata Cloud pinning exception: ' . $e->getMessage());
            }
        }

        // Fallback mock CID generation if no Pinata token is set, or if API request fails.
        // This ensures the application remains functional in test/local environments.
        if (empty($cid)) {
            $isMocked = true;
            $hash = sha1($file->getClientOriginalName() . time());
            // Format mock CID (Qm...)
            $cid = 'Qm' . substr(str_replace(['+', '/', '='], '', base64_encode(hex2bin($hash))), 0, 44);
        }

        // 4. Save locally as backup and record in DB
        $localPath = $file->store('documents', 'public');

        $document = Document::create([
            'user_id' => $request->user()?->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $localPath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'ipfs_cid' => $cid,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $isMocked
                ? 'Berkas berhasil disimpan (Mode Simulasi IPFS / Pinata Token tidak dikonfigurasi)'
                : 'Berkas berhasil disimpan dan di-pin ke IPFS via Pinata',
            'data' => [
                'id' => $document->id,
                'file_name' => $document->file_name,
                'ipfs_cid' => $document->ipfs_cid,
                'ipfs_url' => config('services.pinata.gateway') . $document->ipfs_cid,
                'local_url' => asset('storage/' . $document->file_path),
                'file_size_bytes' => $document->file_size,
                'mime_type' => $document->mime_type,
                'is_mocked' => $isMocked
            ]
        ]);
    }
}
