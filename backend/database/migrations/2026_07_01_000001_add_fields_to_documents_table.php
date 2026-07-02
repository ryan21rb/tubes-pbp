<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Data identitas pemohon dari form
            $table->string('nama')->nullable()->after('ipfs_cid');
            $table->string('nik')->nullable()->after('nama');
            $table->string('kategori')->nullable()->after('nik');
            $table->text('keterangan')->nullable()->after('kategori');
            $table->string('wallet_address')->nullable()->after('keterangan');

            // Status pipeline verifikasi
            $table->enum('status', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu')->after('wallet_address');
            $table->string('tahap_bantuan')->default('Verifikasi Instansi')->after('status');

            // Node-node instansi yang sudah TTD atau menolak (disimpan sebagai JSON)
            $table->json('signed_by')->nullable()->after('tahap_bantuan');
            $table->json('rejected_by')->nullable()->after('signed_by');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn([
                'nama', 'nik', 'kategori', 'keterangan', 'wallet_address',
                'status', 'tahap_bantuan', 'signed_by', 'rejected_by'
            ]);
        });
    }
};
