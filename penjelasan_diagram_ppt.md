# 🖥️ Ringkasan UML Class Diagram & Kode untuk Slide PPT
**Arsitektur Kriptografi & Smart Contract PhilanthropyChain**

Berikut adalah poin-poin penjelasan lengkap, kode fungsi, dan logika matematika yang siap Anda salin ke slide presentasi PowerPoint (PPT) Anda:

---

### 📂 Slide 1: Arsitektur Kelas Smart Contract & ZK-SNARK
*   **Tujuan Diagram**: Memodelkan struktur data, interface, dan relasi antara sirkuit Zero-Knowledge Proof (off-chain), web app dApp (frontend), dan Smart Contract (on-chain).
*   **3 Layer Utama & Hubungannya**:
    1.  **Layer Sirkuit (Circom)**: Penjaga privasi data sensitif. Mendefinisikan aturan matematika pembuktian kelayakan secara anonim.
    2.  **Layer Aplikasi (React Context)**: Penghubung MetaMask dan pembuat bukti (`snarkjs.groth16.fullProve`) di sisi klien.
    3.  **Layer Kontrak (Solidity)**: Validator akhir secara transparan dan permanen di blockchain (`PovertyCheck.sol` & `verifier.sol`).

---

### 📂 Slide 2: Komponen Off-Chain & Pembuatan Bukti (ZKP)
*   **`VerifikasiInstansi` (Circom Template)**:
    *   **Fungsi Kode**: Menerima input rahasia (private) berupa NIK pemohon (`nik_rahasia`) dan tanda tangan digital instansi (`signature_instansi`), serta input publik berupa hash dokumen (`public_doc_hash`).
    *   **Logika Sirkuit**:
        ```circom
        isValid <-- (signature_instansi * nik_rahasia == public_doc_hash) ? 1 : 0;
        isValid === 1;
        ```
        *   **Logika**: Operator `<--` melakukan pencocokan perkalian tanda tangan instansi dengan NIK pemohon terhadap hash dokumen publik. Operator `===` memaksa sirkuit wajib bernilai `isValid == 1`. Jika input salah, sirkuit akan menolak membuat bukti matematika (Proof Generation Fail).
*   **`ZkProof` (Struct)**:
    *   **Fungsi Kode**: Struktur data yang memuat bukti matematika Groth16 (titik kurva eliptik $a$, $b$, $c$).
    *   **Logika**: Bukti ini dikirim oleh frontend dApp ke blockchain tanpa membocorkan nilai `nik_rahasia` dan `signature_instansi` asli.

---

### 📂 Slide 3: Komponen On-Chain (Smart Contracts)
*   **`IZKVerifier` (Interface)**:
    *   **Fungsi Kode**: Menjembatani interaksi antara kontrak utama dan kontrak verifikator.
        ```solidity
        function verifyProof(
            uint256[2] calldata a,
            uint256[2][2] calldata b,
            uint256[2] calldata c,
            uint256[1] calldata input
        ) external view returns (bool);
        ```
*   **`Groth16Verifier` (Kontrak Verifikator - `verifier.sol`)**:
    *   **Fungsi Kode**: Memverifikasi keabsahan bukti Groth16 secara on-chain secara independen tanpa mengetahui rahasia (*Zero-Knowledge*).
    *   **Logika Matematika (Bilinear Pairing)**:
        Mengevaluasi persamaan kurva eliptik:
        $$e(A, B) == e(\alpha, \beta) \cdot e(x, \gamma) \cdot e(C, \delta)$$
        Jika pairing kurva eliptik bernilai benar, fungsi mengembalikan `true`.
*   **`PovertyCheck` (Kontrak Utama - `PovertyCheck.sol`)**:
    *   **Fungsi Kode**: Mengatur logika bisnis persetujuan bantuan sosial.
        ```solidity
        function verifyPovertyStatus(
            uint256[2] memory a,
            uint256[2][2] memory b,
            uint256[2] memory c,
            uint256[1] memory input
        ) public returns (bool) {
            bool isValid = IZKVerifier(zkVerifierAddress).verifyProof(a, b, c, input);
            require(isValid, "Bukti ZKP tidak valid!");
            emit StatusVerified(msg.sender, true);
            return true;
        }
        ```
    *   **Logika**: Menerima bukti dari frontend, meneruskannya ke `Groth16Verifier`, dan memancarkan event `StatusVerified(msg.sender, true)` jika valid untuk dicatat permanen di blockchain.

---

### 📂 Slide 4: Alur Relasi Kelas (Bagaimana Sistem Bekerja)
1.  **Generasi Bukti (Proving)**:
    *   `PhilanthropyContext` mengambil input pengguna $\rightarrow$ menghasilkan bukti `ZkProof` via SnarkJS di sisi klien.
2.  **Pemanggilan Kontrak**:
    *   `PhilanthropyContext` memanggil `PovertyCheck.verifyPovertyStatus()`.
3.  **Verifikasi Matematis**:
    *   `PovertyCheck` meneruskan bukti ke `Groth16Verifier` $\rightarrow$ dicocokkan dengan parameter kunci `VerifyingKey`.
4.  **Emisi Event**:
    *   Jika cocok, `PovertyCheck` memancarkan event `StatusVerified(user, true)` secara on-chain.

---

### 📂 Slide 5: Keunggulan Desain Kelas Ini
*   **Decoupled Architecture**: Logika matematika kriptografi (`Groth16Verifier`) dipisahkan dari logika bisnis utama (`PovertyCheck`), memudahkan upgrade sirkuit secara modular tanpa men-deploy ulang kontrak bisnis.
*   **Privacy by Design**: Kelas `ZkProof` memisahkan data rahasia dari transaksi blockchain, menjamin kerahasiaan NIK dan identitas penerima bantuan sosial.
