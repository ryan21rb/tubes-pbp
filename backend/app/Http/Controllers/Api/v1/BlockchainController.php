<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\BlockchainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockchainController extends Controller
{
    protected BlockchainService $blockchainService;

    public function __construct(BlockchainService $blockchainService)
    {
        $this->blockchainService = $blockchainService;
    }

    /**
     * Verify whether a transaction was mined successfully on-chain.
     * POST /api/v1/blockchain/verify-tx
     */
    public function verifyTransaction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tx_hash' => 'required|string|size:66' // Hex string starting with 0x (64 hex characters + 2 for 0x)
        ]);

        $txHash = $validated['tx_hash'];
        $receipt = $this->blockchainService->getTransactionReceipt($txHash);

        if (!$receipt) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan pada jaringan blockchain. Pastikan Tx Hash benar.'
            ], 404);
        }

        $isSuccess = ($receipt['status'] ?? null) === '0x1';

        return response()->json([
            'status' => $isSuccess ? 'success' : 'error',
            'message' => $isSuccess 
                ? 'Transaksi sukses dan telah dikonfirmasi on-chain.' 
                : 'Transaksi gagal / revert di jaringan blockchain.',
            'data' => [
                'tx_hash' => $txHash,
                'status' => $receipt['status'] ?? '0x0',
                'block_number' => $receipt['blockNumber'] ?? null,
                'gas_used' => $receipt['gasUsed'] ?? null,
                'from' => $receipt['from'] ?? null,
                'to' => $receipt['to'] ?? null,
            ]
        ]);
    }

    /**
     * Get the on-chain ETH balance of a specific address.
     * GET /api/v1/blockchain/balance/{address}
     */
    public function getBalance(Request $request, $address): JsonResponse
    {
        // Simple Ethereum address format validation (0x + 40 hex chars)
        if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $address)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Alamat dompet Ethereum tidak valid.'
            ], 400);
        }

        $balance = $this->blockchainService->getBalance($address);

        return response()->json([
            'status' => 'success',
            'data' => [
                'address' => $address,
                'balance_eth' => $balance,
            ]
        ]);
    }
}
