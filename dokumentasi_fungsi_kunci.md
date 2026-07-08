# 📖 Dokumentasi Fungsi Kunci (Smart Contract, Backend & Frontend)

Dokumen ini merangkum seluruh fungsi dan metode krusial yang digunakan di dalam proyek **Philanthropy Chain**, terbagi menjadi tiga lapisan arsitektur: **Smart Contracts (On-Chain)**, **Backend API (Off-Chain)**, dan **Frontend dApp (React Client)**.

---

## 🪙 1. Smart Contracts (On-Chain / Solidity)

Kontrak pintar bertindak sebagai *state machine* terdesentralisasi yang menguji bukti ZKP dan mengesahkan pencatatan status kelayakan penerima secara permanen di blockchain.

### **A. PovertyCheck.sol**
*   **`constructor(address _zkVerifierAddress)`**
    *   *Fungsi*: Menginisialisasi alamat kontrak verifikasi bukti ZKP (`zkVerifierAddress`) dan menetapkan pembuat kontrak sebagai `admin`.
*   **`updateVerifier(address _newVerifier)`**
    *   *Fungsi*: Mengubah alamat verifikator ZKP baru. Hanya boleh dipanggil oleh `admin`.
    *   *Parameter*: `_newVerifier` (alamat smart contract verifikator yang baru).
*   **`verifyPovertyStatus(uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[1] input)`**
    *   *Fungsi*: Fungsi utama yang memanggil interface `IZKVerifier` untuk memvalidasi bukti ZK-SNARK (bilinear pairing). Jika matematika valid, kontrak memancarkan event `StatusVerified(msg.sender, true)` untuk mengesahkan status penerima di blockchain.

### **B. MockVerifier.sol**
*   **`verifyProof(uint256[2], uint256[2][2], uint256[2], uint256[1])`**
    *   *Fungsi*: Mensimulasikan hasil verifikasi proof secara cepat (selalu mengembalikan `true`) untuk pengujian otomatis massal / benchmark throughput tanpa beban komputasi lokal yang berat.

---

### **🛠️ 5. Perancangan Smart Contract**
*   **• State Variables (Data Permanen di Ledger)**:
    *   **`admin`** (`address`): Menyimpan alamat pemilik kontrak (admin) yang berhak mengubah konfigurasi verifikator.
    *   **`zkVerifierAddress`** (`address`): Menyimpan alamat smart contract verifikator bukti ZKP aktif yang berjalan di blockchain.
*   **• Functions (Daftar Fungsi Utama)**:
    *   **`constructor(address _zkVerifierAddress)`**: Inisialisasi awal hak admin dan alamat verifikator ZKP.
    *   **`updateVerifier(address _newVerifier)`**: Memperbarui/mengalihkan alamat modul verifikator ZKP.
    *   **`verifyPovertyStatus(uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[1] input)`**: Memvalidasi bukti ZK-SNARK secara on-chain dan memancarkan event kelayakan status.

---

## 🖥️ 2. Backend API (Off-Chain / Laravel 13)

Laravel bertindak sebagai jembatan off-chain untuk mengelola autentikasi pengguna, penyimpanan data non-blockchain, serta interaksi file dengan IPFS.

### **A. AuthController.php**
*   **`register(Request $request)`**
    *   *Fungsi*: Mendaftarkan pengguna baru (Donatur, Yayasan, Instansi), melakukan enkripsi password menggunakan `Hash::make`, menyimpan alamat wallet, dan mengembalikan token JWT.
*   **`login(Request $request)`**
    *   *Fungsi*: Memvalidasi kredensial pengguna, memperbarui alamat wallet aktif jika ada perubahan, dan mengeluarkan token akses JWT.

### **B. CampaignController.php**
*   **`index(Request $request)`**
    *   *Fungsi*: Mengambil daftar seluruh program donasi/kampanye aktif beserta data doa komentar dan laporan alokasi dana secara relasional.
*   **`store(Request $request)`**
    *   *Fungsi*: Membuat program donasi baru (Yayasan-only) dan menyimpannya di database off-chain.
*   **`donate(Request $request)`**
    *   *Fungsi*: Menyinkronkan nominal donasi terkumpul setelah transaksi di blockchain sukses, mencatat history transaksi, dan menyimpan pesan/doa donatur.

### **C. DocumentController.php**
*   **`upload(Request $request)`**
    *   *Fungsi*: Menerima dokumen fisik (KTP/SKTM), membatasi ukuran file (Max 2MB), mengunggahnya ke **IPFS Pinata Gateway**, dan mengembalikan hash **CID** unik dokumen untuk kebutuhan verifikasi.

---

## 🌐 3. Frontend dApp (React Vite / Ethers.js)

React dApp bertindak sebagai antarmuka pengguna untuk interaksi blockchain menggunakan MetaMask dan interaksi data dinamis dengan Laravel.

### **A. PhilanthropyContext.jsx (State Provider & Web3 Link)**
*   **`connectWallet()`**
    *   *Fungsi*: Menghubungkan browser dApp ke ekstensi dompet Web3 MetaMask (`BrowserProvider`) dan menyimpan alamat wallet aktif pengguna ke state global.
*   **`ajukanBantuan(formData, fileMap)`**
    *   *Fungsi*: Mengunggah dokumen SKTM/KTP ke API Laravel (untuk di-upload ke IPFS), memperoleh kode hash CID, lalu mengajukan status antrean verifikasi bantuan bagi calon penerima.
*   **`tambahProgram(programBaru)`**
    *   *Fungsi*: Mengirimkan permintaan API pembuatan kampanye donasi baru ke backend Laravel dan mengupdate antarmuka dashboard Yayasan.
*   **`tambahDonasi(donasiData)`**
    *   *Fungsi*: Memanggil provider MetaMask untuk mentransfer ETH ke wallet program donasi tujuan secara on-chain, lalu mengirimkan bukti transaksi (Tx Hash) ke Laravel untuk disinkronkan.
*   **`voteDocument(id, walletAddress, voteStatus)`**
    *   *Fungsi*: Memfasilitasi voting konsensus multi-node antar instansi pemerintah untuk menandatangani atau menolak pengajuan kelayakan penerima bantuan.
