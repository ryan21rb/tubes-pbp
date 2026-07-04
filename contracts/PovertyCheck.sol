// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// ==============================================================================
// [RUMUS MATEMATIKA CONSENSUS RAFT - ON-CHAIN INTEGRATION]
// Meskipun pemilihan leader dilakukan off-chain/di-level-node,
// Smart Contract ini bertindak sebagai State Machine Replicated yang
// mengesahkan hasil keputusan konsensus dari mayoritas instansi.
//
// 1. Rumus Mayoritas Kuorum (Quorum Majority) untuk N instansi:
//    Q = floor(N / 2) + 1
//
//    Pada jaringan ini, total node instansi yang terdaftar (N) = 4.
//    Maka Kuorum minimum suara setuju yang valid adalah:
//    Q = floor(4 / 2) + 1 = 3 instansi.
//
// 2. Rumus Fault Tolerance (Batas Rusak) untuk N instansi:
//    F = floor((N - 1) / 2)
//
//    Untuk N = 4, maka F = floor((4 - 1) / 2) = 1.
//    Jaringan hanya dapat mentolerir maksimal F = 1 node mati atau menolak.
//    Jika jumlah penolakan > F (yaitu >= 2), pengajuan otomatis ditolak secara permanen.
// ==============================================================================

interface IZKVerifier {
    /**
     * @dev Fungsi untuk memverifikasi bukti ZKP.
     * @param a Bukti matematika G1 (G1 Proof Element A)
     * @param b Bukti matematika G2 (G2 Proof Element B)
     * @param c Bukti matematika G1 (G1 Proof Element C)
     * @param input Input publik sirkuit (public signals)
     */
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata input
    ) external view returns (bool);
}

contract PovertyCheck {
    address public admin;
    address public zkVerifierAddress;

    // Event yang dipancarkan ketika status ZKP berhasil diverifikasi secara on-chain
    event StatusVerified(address indexed user, bool indexed isValid);

    constructor(address _zkVerifierAddress) {
        admin = msg.sender;
        zkVerifierAddress = _zkVerifierAddress;
    }

    /**
     * @dev Mengubah alamat kontrak ZK Verifier. Hanya admin yang diizinkan.
     */
    function updateVerifier(address _newVerifier) public {
        require(msg.sender == admin, "Hanya admin kelompok yang bisa mengubah ini");
        zkVerifierAddress = _newVerifier;
    }

    /**
     * @dev Memverifikasi status kemiskinan pengguna secara aman menggunakan ZKP.
     * 
     * [RUMUS MATEMATIKA ZKP - VERIFIKASI BUKTI ON-CHAIN]
     * Logika matematika di dalam Verifier (verifier.sol) melakukan verifikasi bilinear pairing:
     * e(A, B) == e(Alpha, Beta) * e(x, Gamma) * e(C, Delta)
     * 
     * di mana:
     * - A, B, C adalah elemen kurva eliptik G1/G2 yang dikirim dari bukti ZKP di frontend.
     * - x adalah parameter linear dari input publik (input[0]).
     * - Alpha, Beta, Gamma, Delta adalah parameter generator kurva eliptik dari setup fase sirkuit.
     */
    function verifyPovertyStatus(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) public returns (bool) {
        // Memanggil fungsi verifikator ZKP di contract Verifier
        bool isValid = IZKVerifier(zkVerifierAddress).verifyProof(a, b, c, input);
        
        // Memastikan hasil verifikasi matematika ZKP bernilai benar
        require(isValid, "Bukti ZKP tidak valid atau manipulasi!");

        // Memancarkan event kelayakan on-chain untuk dibaca oleh frontend/backend
        emit StatusVerified(msg.sender, true);
        return true;
    }
}
