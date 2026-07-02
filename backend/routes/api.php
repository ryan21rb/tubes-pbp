<?php

use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\CampaignController;
use App\Http\Controllers\Api\v1\DashboardController;
use App\Http\Controllers\Api\v1\DocumentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Otentikasi pengguna dApp
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login',    [AuthController::class, 'login']);

    // Baca & buat kampanye (PUBLIC — Yayasan bisa publish tanpa token)
    Route::get('/campaigns',  [CampaignController::class, 'index']);
    Route::post('/campaigns', [CampaignController::class, 'store']);

    // Baca semua pengajuan bantuan (PUBLIC — Instansi & Yayasan bisa akses)
    Route::get('/documents', [DocumentController::class, 'index']);

    // Node API Polling
    Route::post('/nodes/heartbeat', [\App\Http\Controllers\Api\v1\NodeController::class, 'heartbeat']);
    Route::get('/nodes/status', [\App\Http\Controllers\Api\v1\NodeController::class, 'status']);

    // Endpoint Terproteksi Token Laravel Sanctum
    Route::middleware('auth:sanctum')->group(function () {
        // Logout
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Upload berkas persyaratan korban & pinning IPFS
        Route::post('/document/upload', [DocumentController::class, 'upload']);

        // Update status pengajuan: TTD atau Tolak (oleh Instansi)
        Route::patch('/documents/{id}/status', [DocumentController::class, 'updateStatus']);
        Route::post('/documents/{id}/vote', [DocumentController::class, 'vote']);

        // Check document status untuk pemohon
        Route::get('/my-document/status', [DocumentController::class, 'myDocumentStatus']);

        // Dashboard stats
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Blockchain RPC integrations
        Route::post('/blockchain/verify-tx',        [\App\Http\Controllers\Api\v1\BlockchainController::class, 'verifyTransaction']);
        Route::get('/blockchain/balance/{address}', [\App\Http\Controllers\Api\v1\BlockchainController::class, 'getBalance']);

        // Comments and reports
        Route::post('/campaigns/{id}/comments', [CampaignController::class, 'addComment']);
        Route::post('/campaigns/{id}/reports',  [CampaignController::class, 'addReport']);
    });
});
