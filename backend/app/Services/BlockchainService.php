<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BlockchainService
{
    protected string $rpcUrl;
    protected string $povertyCheckAddress;

    public function __construct()
    {
        $this->rpcUrl = config('services.blockchain.rpc_url', 'http://127.0.0.1:8545');
        $this->povertyCheckAddress = config('services.blockchain.poverty_check_address', '');
    }

    /**
     * Call Ethereum JSON-RPC method.
     */
    protected function callRpc(string $method, array $params = []): ?array
    {
        try {
            $response = Http::post($this->rpcUrl, [
                'jsonrpc' => '2.0',
                'method' => $method,
                'params' => $params,
                'id' => 1
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error("Blockchain RPC failure for method {$method}: " . $response->body());
        } catch (\Exception $e) {
            Log::error("Blockchain RPC exception for method {$method}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Get transaction receipt for a given transaction hash.
     */
    public function getTransactionReceipt(string $txHash): ?array
    {
        $response = $this->callRpc('eth_getTransactionReceipt', [$txHash]);
        return $response['result'] ?? null;
    }

    /**
     * Verify if a transaction was successful (status = 0x1).
     */
    public function isTransactionSuccessful(string $txHash): bool
    {
        $receipt = $this->getTransactionReceipt($txHash);
        if (!$receipt) {
            return false;
        }

        $status = $receipt['status'] ?? null;
        // In Ethereum RPC, 0x1 means success, 0x0 means failure
        return $status === '0x1';
    }

    /**
     * Get balance of an address in Ether (ETH).
     */
    public function getBalance(string $address): float
    {
        $response = $this->callRpc('eth_getBalance', [$address, 'latest']);
        $hexBalance = $response['result'] ?? null;

        if (!$hexBalance) {
            return 0.0;
        }

        return $this->hexToEth($hexBalance);
    }

    /**
     * Convert Hex Wei string to float ETH.
     */
    protected function hexToEth(string $hex): float
    {
        if (str_starts_with($hex, '0x')) {
            $hex = substr($hex, 2);
        }

        if (empty($hex)) {
            return 0.0;
        }

        // Convert hex to decimal string safely
        $dec = $this->hexToDec($hex);

        // Divide decimal Wei by 1e18 to get ETH
        return (float) $dec / 1e18;
    }

    /**
     * Safe hex to decimal conversion supporting large numbers.
     */
    protected function hexToDec(string $hex): string
    {
        if (function_exists('bcmul') && function_exists('bcadd')) {
            $dec = '0';
            $len = strlen($hex);
            for ($i = 0; $i < $len; $i++) {
                $hexDigit = hexdec($hex[$i]);
                $dec = bcmul($dec, '16');
                $dec = bcadd($dec, (string)$hexDigit);
            }
            return $dec;
        }

        // Fallback for systems without bcmath
        return (string) hexdec($hex);
    }
}
