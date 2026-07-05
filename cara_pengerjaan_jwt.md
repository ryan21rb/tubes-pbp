# Panduan Implementasi Autentikasi JWT & Penyaringan Konten Pengguna (dApp)

Dokumentasi ini menjelaskan langkah-langkah implementasi token JWT (JSON Web Token) kustom untuk menggantikan/melengkapi sistem token bawaan Laravel Sanctum, serta bagaimana data pengajuan disaring di frontend & backend agar setiap pengguna hanya melihat data miliknya sendiri.

---

## 🛠️ Ringkasan Berkas yang Diubah

### Backend (Laravel)
1. **`app/Services/JwtService.php` (Baru):** Berisi logika enkripsi/dekripsi JWT (HMAC-SHA256) menggunakan `APP_KEY` Laravel.
2. **`app/Http/Middleware/JwtMiddleware.php` (Baru):** Middleware untuk memvalidasi token dari header `Authorization: Bearer <token>` dan masuk secara otomatis sebagai user untuk sesi request tersebut.
3. **`bootstrap/app.php`:** Mendaftarkan alias middleware `'auth.jwt'`.
4. **`routes/api.php`:** Mengganti proteksi endpoint dari `auth:sanctum` menjadi `auth.jwt`.
5. **`app/Http/Controllers/Api/v1/AuthController.php`:** Memodifikasi `login` dan `register` agar mengembalikan token JWT hasil dari `JwtService`, serta menyederhanakan `logout` secara stateless.
6. **`app/Http/Controllers/Api/v1/DocumentController.php`:** Memodifikasi method `index()` untuk mendeteksi token JWT dan menyaring data pengajuan jika yang login adalah `penerima`.

### Frontend (React / Vite)
1. **`src/context/PhilanthropyContext.jsx`:** Menambahkan state `currentUser` dan menyimpannya di `localStorage` (`current_user`), serta membagikannya ke komponen anak.
2. **`src/pages/landingpage.jsx`:** Menyimpan data profile user ke dalam context (`setAuthToken`) setelah berhasil login.
3. **`src/pages/penerima.jsx`:** Memuat profil pengguna secara dinamis dari `currentUser` dan mencari status pengajuan miliknya secara otomatis melalui wallet address MetaMask atau email terdaftar, menggantikan data hardcode "Ahmad Sudirman".
4. **`src/pages/donatur.jsx`:** Memuat nama profil donatur secara dinamis dari `currentUser`, menggantikan data hardcode "Budi Santoso".

---

## 💻 Penjelasan Detail Pengerjaan Kodingan

### 1. Backend: Pembuatan `JwtService`
Kami menggunakan standar token JWT HS256 (HMAC SHA-256). Token terdiri dari tiga bagian: `Header.Payload.Signature` yang digabungkan dengan titik `.`.
*   **Kunci Rahasia:** Kami mengambil `config('app.key')` Laravel. Jika berawalan `base64:`, kunci tersebut didekode terlebih dahulu untuk mendapatkan bit enkripsi yang kuat.
*   **Klaim Payload:** Payload berisi klaim standar seperti issuer (`iss`), subject (`sub` berisi ID user), issue-time (`iat`), expiration (`exp` yang diset 24 jam), serta `email` dan `role` user.

### 2. Backend: Pembuatan `JwtMiddleware`
Middleware mengekstrak token Bearer dari request header:
```php
$token = $request->bearerToken();
```
Jika token ada dan valid (tidak kedaluwarsa & tanda tangan cocok), middleware mencari user di database berdasarkan klaim `sub` (ID user). Setelah ditemukan, sistem melakukan login manual secara dinamis untuk request tersebut:
```php
auth()->login($user);
```
Dengan ini, helper Laravel seperti `$request->user()` atau `auth()->user()` tetap dapat bekerja secara penuh tanpa mengubah logika controller internal.

### 3. Backend: Filter Dokumen Khusus `penerima`
Pada method `index()` di `DocumentController.php`, sistem memeriksa apakah user terautentikasi melalui token JWT yang dikirimkan.
Jika user terdeteksi memiliki role **`penerima`**, query dokumen disaring agar hanya menampilkan baris data yang memiliki `user_id` sama dengan ID user tersebut:
```php
if ($user && ($user->role->value ?? $user->role) === 'penerima') {
    $query->where('user_id', $user->id);
}
```
Untuk pengguna dengan role **`instansi`** atau **`yayasan`**, saringan ini diabaikan sehingga mereka tetap dapat melihat seluruh dokumen untuk keperluan validasi kuorum dan persetujuan.

### 4. Frontend: Sinkronisasi Profil Dinamis
*   Sebelumnya, profil di halaman `PenerimaPage` (`penerima.jsx`) menggunakan data statis Ahmad Sudirman dengan NIK `3201234567890001`. Hal ini menyebabkan user dengan NIK lain tidak akan pernah menemukan datanya.
*   Kami memperbarui `landingpage.jsx` agar meng-extract objek `user` dari API response login:
    ```javascript
    const user = response?.user || response?.data?.user || null;
    ```
*   Data user ini disimpan ke `localStorage` dan dimuat ke state `currentUser` dalam `PhilanthropyContext.jsx`.
*   Komponen `penerima.jsx`, `donatur.jsx`, `instansi.jsx`, dan `yayasan.jsx` mengonsumsi state `currentUser` dan `walletAddress` tersebut untuk meng-update nama pengelola, nama yayasan, email, dan mendeteksi data pengajuan/alamat e-wallet miliknya sendiri secara real-time.

---

## 🚀 Cara Pengujian

1.  **Jalankan Server Backend & Frontend:**
    Buka terminal dan jalankan server lokal Anda (misal `npm run dev` atau melalui skrip Laravel).
2.  **Daftar/Masuk Sebagai Penerima Baru:**
    *   Lakukan registrasi dengan email baru (misal `budi@penerima.com`), pilih role **Penerima**, dan hubungkan akun MetaMask Anda.
    *   Setelah masuk, Anda akan langsung dialihkan ke dashboard Penerima. Nama di pojok kiri atas dan halaman profil akan menampilkan **Budi** (sesuai akun Anda), bukan "Ahmad Sudirman".
3.  **Unggah Pengajuan Dokumen Baru:**
    *   Unggah berkas KTP/SKTM.
    *   Data pengajuan akan tersimpan di backend dengan `user_id` milik Anda.
    *   Halaman status bantuan akan langsung melacak kemajuan berkas Anda secara dinamis.
4.  **Uji Isolasi Data (Paling Penting):**
    *   Keluar (Logout) dari akun Penerima pertama.
    *   Masuk menggunakan akun Penerima kedua (atau buat baru).
    *   Periksa halaman status bantuan pada akun kedua. Anda **tidak akan bisa melihat** berkas pengajuan milik akun Penerima pertama karena data sudah difilter di sisi backend dan diikat ke ID pengguna masing-masing.
