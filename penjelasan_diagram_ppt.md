# 🖥️ Ringkasan UML Class Diagram untuk Slide PPT
**Arsitektur Kriptografi & Smart Contract PhilanthropyChain**

Berikut adalah poin-poin penjelasan singkat, padat, dan terstruktur yang siap Anda salin ke slide presentasi PowerPoint (PPT):

---

### **Slide 1: Arsitektur Kelas Smart Contract & ZK-SNARK**
*   **Tujuan Diagram**: Memodelkan struktur data, interface, dan relasi antara sirkuit Zero-Knowledge Proof (off-chain), web app dApp (frontend), dan Smart Contract (on-chain).
*   **3 Layer Utama**:
    1.  **Layer Sirkuit (Circom)**: Penjaga privasi data sensitif.
    2.  **Layer Aplikasi (React Context)**: Penghubung MetaMask dan pembuat bukti.
    3.  **Layer Kontrak (Solidity)**: Validator akhir secara transparan dan permanen.

---

### **Slide 2: Komponen Off-Chain & Pembuatan Bukti (ZKP)**
*   **`VerifikasiInstansi` (Circom Template)**:
    *   Mendefinisikan aturan sirkuit matematis secara rahasia.
    *   **Aturan/Constraint**: NIK Rahasia dikalikan Tanda Tangan Instansi harus menghasilkan Hash Dokumen Publik (`isValid == 1`).
*   **`ZkProof` (Struct)**:
    *   Struktur data bukti kriptografi Groth16 (`a`, `b`, `c`).
    *   Dikirim oleh frontend ke blockchain tanpa membocorkan NIK asli.

---

### **Slide 3: Komponen On-Chain (Smart Contracts)**
*   **`IZKVerifier` (Interface)**:
    *   Standar fungsi verifikasi bukti ZKP (`verifyProof`).
*   **`Groth16Verifier` (Kontrak Verifikator)**:
    *   Mengimplementasikan `IZKVerifier` (Hasil export SnarkJS).
    *   Menggunakan `VerifyingKey` (titik kurva eliptik $\alpha, \beta, \gamma, \delta$) untuk mengesahkan bukti secara matematis.
*   **`PovertyCheck` (Kontrak Utama)**:
    *   Mengatur logika bisnis persetujuan bantuan sosial.
    *   Memanggil `Groth16Verifier` dan memancarkan event `StatusVerified` jika bukti valid.

---

### **Slide 4: Alur Relasi Kelas (Bagaimana Sistem Bekerja)**
1.  **Generasi Bukti (Proving)**:
    *   `PhilanthropyContext` mengambil input pengguna $\rightarrow$ menghasilkan bukti `ZkProof` via SnarkJS.
2.  **Pemanggilan Kontrak**:
    *   `PhilanthropyContext` memanggil `PovertyCheck.verifyPovertyStatus()`.
3.  **Verifikasi Matematis**:
    *   `PovertyCheck` meneruskan bukti ke `Groth16Verifier` $\rightarrow$ dicocokkan dengan parameter kunci `VerifyingKey`.
4.  **Emisi Event**:
    *   Jika cocok, `PovertyCheck` memancarkan event `StatusVerified(user, true)` secara on-chain.

---

### **Slide 5: Keunggulan Desain Kelas Ini**
*   **Decoupled Architecture**: Logika matematika kriptografi (`Groth16Verifier`) dipisahkan dari logika bisnis utama (`PovertyCheck`), memudahkan upgrade sirkuit.
*   **Privacy by Design**: Kelas `ZkProof` memisahkan data rahasia dari transaksi blockchain, menjamin kerahasiaan NIK dan identitas penerima bantuan sosial.
