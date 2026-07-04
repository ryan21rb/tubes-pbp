pragma circom 2.0.0;

// ==============================================================================
// [RUMUS MATEMATIKA ZKP - CIRCOM CIRCUIT CONSTRAINT]
// Sirkuit ZKP mendefinisikan hubungan polinomial antara input rahasia (private)
// dan input publik (public) yang tidak boleh dibocorkan ke publik.
//
// Rumus Persamaan Sirkuit:
// signature_instansi * nik_rahasia == public_doc_hash
//
// Keterangan:
// - nik_rahasia (Private): NIK pemohon bantuan sosial (dirahasiakan agar anonim).
// - signature_instansi (Private): Tanda tangan digital kriptografis dari instansi.
// - public_doc_hash (Public): Hash dari dokumen fisik (KTP/SKTM) yang tersimpan di blockchain.
// ==============================================================================

template VerifikasiInstansi() {
    // 1. INPUT DATA RAHASIA (PRIVATE SIGNALS)
    signal input nik_rahasia;
    signal input signature_instansi;
    
    // 2. INPUT DATA PUBLIK (PUBLIC SIGNALS)
    signal input public_doc_hash;

    // 3. OUTPUT SIRKUIT (STATUS VALIDASI)
    signal output isValid;

    // [RUMUS MATEMATIKA ZKP - CONSTRAINTS GENERATION]
    // Circom menggunakan operator <-- untuk penugasan nilai (assignment) 
    // dan === untuk mendefinisikan batasan kuadratik (quadratic constraints).
    
    // Penugasan nilai ke signal isValid: bernilai 1 jika relasi perkalian benar, 0 jika salah
    isValid <-- (signature_instansi * nik_rahasia == public_doc_hash) ? 1 : 0;
    
    // Batasan Keras (Constraint): Memaksa output isValid wajib sama dengan 1.
    // Jika input rahasia yang dimasukkan tidak memenuhi relasi matematika di atas,
    // sirkuit akan menolak untuk membuat bukti matematika (Proof Generation Fail).
    isValid === 1;
}

// Menetapkan component main dan menyatakan public_doc_hash sebagai satu-satunya input publik
component main {public [public_doc_hash]} = VerifikasiInstansi();
