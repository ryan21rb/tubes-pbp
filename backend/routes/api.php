<?php

use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\CampaignController;
use App\Http\Controllers\Api\v1\DashboardController;
use App\Http\Controllers\Api\v1\DocumentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Otentikasi pengguna dApp
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Data pendukung kampanye (Fetch/Read)
    Route::get('/campaigns', [CampaignController::class, 'index']);

    // Endpoint Terproteksi Token Laravel Sanctum
    Route::middleware('auth:sanctum')->group(function () {
        // Logout
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Upload berkas persyaratan korban & pinning IPFS
        Route::post('/document/upload', [DocumentController::class, 'upload']);

        // Dashboard stats ringkasan profil & pelaporan
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Blockchain RPC integrations
        Route::post('/blockchain/verify-tx', [\App\Http\Controllers\Api\v1\BlockchainController::class, 'verifyTransaction']);
        Route::get('/blockchain/balance/{address}', [\App\Http\Controllers\Api\v1\BlockchainController::class, 'getBalance']);

        // Create campaign, comments, and reports
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::post('/campaigns/{id}/comments', [CampaignController::class, 'addComment']);
        Route::post('/campaigns/{id}/reports', [CampaignController::class, 'addReport']);
    });
});
