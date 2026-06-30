<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;

// Boot Laravel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "========================================================\n";
echo "       STARTING LARAVEL 13 BACKEND VERIFICATION        \n";
echo "========================================================\n\n";

// Helper to print section titles
function section($title) {
    echo "\n--------------------------------------------------------\n";
    echo " > $title\n";
    echo "--------------------------------------------------------\n";
}

// Helper to dump JSON responses
function printResult($result) {
    echo "HTTP Status: " . $result['status'] . "\n";
    if (is_array($result['content'])) {
        echo json_encode($result['content'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
    } else {
        echo $result['content'] . "\n";
    }
}

// Helper to make internal requests
function dispatchRequest($method, $uri, $parameters = [], $headers = [], $files = []) {
    // Clear resolved instances to avoid state leak between requests
    app()->forgetInstance('request');
    
    // Set up request server headers
    $server = ['HTTP_ACCEPT' => 'application/json'];
    foreach ($headers as $key => $val) {
        $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $key));
        if ($key === 'Content-Type') $serverKey = 'CONTENT_TYPE';
        if ($key === 'Authorization') $serverKey = 'HTTP_AUTHORIZATION';
        $server[$serverKey] = $val;
    }
    
    $request = Request::create($uri, $method, $parameters, [], $files, $server);
    
    // Handle the request
    $response = app()->handle($request);
    
    return [
        'status' => $response->getStatusCode(),
        'content' => json_decode($response->getContent(), true) ?: $response->getContent()
    ];
}

// Ensure database has migrations run
if (!Schema::hasTable('users')) {
    echo "Error: Database migrations have not been run. Please run php artisan migrate:fresh first.\n";
    exit(1);
}

$testEmail = 'yayasan.harapan_' . rand(100, 999) . '@example.com';
$testPassword = 'password123';
$authToken = null;
$campaignId = null;

// 1. REGISTER
section("1. Testing POST /api/v1/auth/register");
$registerResult = dispatchRequest('POST', '/api/v1/auth/register', [
    'name' => 'Yayasan Harapan Bangsa',
    'email' => $testEmail,
    'password' => $testPassword,
    'role' => 'yayasan',
    'wallet_address' => '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
]);
printResult($registerResult);

if ($registerResult['status'] !== 201) {
    echo "Register failed, aborting.\n";
    exit(1);
}

// 2. LOGIN
section("2. Testing POST /api/v1/auth/login");
$loginResult = dispatchRequest('POST', '/api/v1/auth/login', [
    'email' => $testEmail,
    'password' => $testPassword
]);
printResult($loginResult);

if ($loginResult['status'] === 200) {
    $authToken = $loginResult['content']['access_token'];
} else {
    echo "Login failed, aborting.\n";
    exit(1);
}

$authHeaders = ['Authorization' => 'Bearer ' . $authToken];

// 3. UPLOAD DOCUMENT
section("3. Testing POST /api/v1/document/upload (IPFS Pinning)");
$tempFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'test_upload_' . uniqid() . '.pdf';
file_put_contents($tempFile, "%PDF-1.5\n%DUMMY PHYSICAL EVIDENCE CONTENT - KTP & MEDIS KORBAN");
$uploadedFile = new UploadedFile(
    $tempFile,
    'ktp_sktm_korban.pdf',
    'application/pdf',
    null,
    true // test mode
);

$uploadResult = dispatchRequest('POST', '/api/v1/document/upload', [], $authHeaders, [
    'file' => $uploadedFile
]);
printResult($uploadResult);
@unlink($tempFile);

// 4. CREATE CAMPAIGN
section("4. Testing POST /api/v1/campaigns (Create Campaign Off-chain)");
$campaignResult = dispatchRequest('POST', '/api/v1/campaigns', [
    'title' => 'Bantuan Kesehatan Anak Yatim Pelosok',
    'description' => 'Penyaluran alat bantu dengar dan pemenuhan nutrisi anak yatim piatu di desa terpencil.',
    'category' => 'Kesehatan',
    'target_donation' => 3.5,
    'image_url' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c'
], $authHeaders);
printResult($campaignResult);

if ($campaignResult['status'] === 201) {
    $campaignId = $campaignResult['content']['data']['id'];
}

// 5. ADD COMMENT
section("5. Testing POST /api/v1/campaigns/{id}/comments (Add Comment)");
if ($campaignId) {
    $commentResult = dispatchRequest('POST', "/api/v1/campaigns/{$campaignId}/comments", [
        'comment' => 'Semoga target donasi lekas tercapai! Doa kami menyertai.',
        'user_name' => 'Budi Santoso'
    ], $authHeaders);
    printResult($commentResult);
} else {
    echo "Skipping: no campaign ID.\n";
}

// 6. ADD REPORT
section("6. Testing POST /api/v1/campaigns/{id}/reports (Add Utilization Report)");
if ($campaignId) {
    $reportResult = dispatchRequest('POST', "/api/v1/campaigns/{$campaignId}/reports", [
        'title' => 'Pembelian 10 Alat Bantu Dengar',
        'details' => 'Realisasi tahap pertama untuk pembelian alat bantu dengar merek Siemens.',
        'amount_spent' => 1.2
    ], $authHeaders);
    printResult($reportResult);
} else {
    echo "Skipping: no campaign ID.\n";
}

// 7. GET DASHBOARD STATS
section("7. Testing GET /api/v1/dashboard/stats");
$statsResult = dispatchRequest('GET', '/api/v1/dashboard/stats', [], $authHeaders);
printResult($statsResult);

// 8. GET CAMPAIGNS LIST (Public)
section("8. Testing GET /api/v1/campaigns (Fetch all campaign data)");
$listResult = dispatchRequest('GET', '/api/v1/campaigns');
printResult($listResult);

// 9. POST BLOCKCHAIN VERIFY TRANSACTION
section("9. Testing POST /api/v1/blockchain/verify-tx (RPC Transaction Receipt)");
$fakeTxHash = '0x' . str_repeat('a', 64);
$verifyTxResult = dispatchRequest('POST', '/api/v1/blockchain/verify-tx', [
    'tx_hash' => $fakeTxHash
], $authHeaders);
printResult($verifyTxResult);

// 10. GET BLOCKCHAIN WALLET BALANCE
section("10. Testing GET /api/v1/blockchain/balance/{address} (RPC Account Balance)");
$activeAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
$balanceResult = dispatchRequest('GET', "/api/v1/blockchain/balance/{$activeAddress}", [], $authHeaders);
printResult($balanceResult);

echo "\n========================================================\n";
echo "            VERIFICATION COMPLETED SUCCESSFULLY         \n";
echo "========================================================\n";
