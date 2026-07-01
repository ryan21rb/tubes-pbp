<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

// Boot Laravel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "========================================================\n";
echo "      UPLOADING REAL 1X1 PNG IMAGE TO PINATA IPFS       \n";
echo "========================================================\n\n";

// Helper to make internal requests
function dispatchRequest($method, $uri, $parameters = [], $headers = [], $files = []) {
    app()->forgetInstance('request');
    $server = ['HTTP_ACCEPT' => 'application/json'];
    foreach ($headers as $key => $val) {
        $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $key));
        if ($key === 'Content-Type') $serverKey = 'CONTENT_TYPE';
        if ($key === 'Authorization') $serverKey = 'HTTP_AUTHORIZATION';
        $server[$serverKey] = $val;
    }
    $request = Request::create($uri, $method, $parameters, [], $files, $server);
    $response = app()->handle($request);
    return [
        'status' => $response->getStatusCode(),
        'content' => json_decode($response->getContent(), true) ?: $response->getContent()
    ];
}

// 1. REGISTER DUMMY USER FOR TOKEN
$testEmail = 'test_real_' . rand(100, 999) . '@example.com';
$registerResult = dispatchRequest('POST', '/api/v1/auth/register', [
    'name' => 'Yayasan Real Test',
    'email' => $testEmail,
    'password' => 'password123',
    'role' => 'yayasan',
    'wallet_address' => '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
]);

if ($registerResult['status'] !== 201) {
    echo "Failed to register dummy user.\n";
    exit(1);
}

$authToken = $registerResult['content']['access_token'];
$authHeaders = ['Authorization' => 'Bearer ' . $authToken];

// 2. CREATE A REAL 1X1 TRANSPARENT PNG FILE
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
$tempFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'real_test_' . uniqid() . '.png';
file_put_contents($tempFile, base64_decode($pngBase64));

$uploadedFile = new UploadedFile(
    $tempFile,
    'bukti_medis_asli.png',
    'image/png',
    null,
    true // test mode
);

// 3. UPLOAD FILE
$uploadResult = dispatchRequest('POST', '/api/v1/document/upload', [], $authHeaders, [
    'file' => $uploadedFile
]);

echo "HTTP Status: " . $uploadResult['status'] . "\n";
echo json_encode($uploadResult['content'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

@unlink($tempFile);

echo "========================================================\n";
echo "                   PROCESS COMPLETED                     \n";
echo "========================================================\n";
