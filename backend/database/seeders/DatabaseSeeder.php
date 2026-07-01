<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Yayasan User
        User::create([
            'name' => 'Yayasan Peduli Sesama',
            'email' => 'yayasan@example.com',
            'password' => Hash::make('password123'),
            'role' => 'yayasan',
            'wallet_address' => '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat Signer 0
        ]);

        // 2. Penerima User
        User::create([
            'name' => 'Penerima Bantuan A',
            'email' => 'penerima@example.com',
            'password' => Hash::make('password123'),
            'role' => 'penerima',
            'wallet_address' => '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Hardhat Signer 1
        ]);

        // 3. Instansi - Dinsos
        User::create([
            'name' => 'Dinas Sosial',
            'email' => 'dinsos@example.com',
            'password' => Hash::make('password123'),
            'role' => 'instansi',
            'instansi_type' => 'dinsos',
            'wallet_address' => '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Hardhat Signer 2
        ]);

        // 4. Instansi - Diknas
        User::create([
            'name' => 'Dinas Pendidikan',
            'email' => 'diknas@example.com',
            'password' => Hash::make('password123'),
            'role' => 'instansi',
            'instansi_type' => 'diknas',
            'wallet_address' => '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Hardhat Signer 3
        ]);

        // 5. Instansi - BPBD
        User::create([
            'name' => 'BPBD Kabupaten',
            'email' => 'bpbd@example.com',
            'password' => Hash::make('password123'),
            'role' => 'instansi',
            'instansi_type' => 'bpbd',
            'wallet_address' => '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Hardhat Signer 4
        ]);

        // 6. Instansi - Dinkes
        User::create([
            'name' => 'Dinas Kesehatan',
            'email' => 'dinkes@example.com',
            'password' => Hash::make('password123'),
            'role' => 'instansi',
            'instansi_type' => 'dinkes',
            'wallet_address' => '0x9965507D1a0565b993761c9441f5a5b507d3B02C', // Hardhat Signer 5
        ]);

        // 7. Donatur / Umum User
        User::create([
            'name' => 'Donatur Umum A',
            'email' => 'donatur@example.com',
            'password' => Hash::make('password123'),
            'role' => 'donatur',
            'wallet_address' => '0x976EA74026E726554dB657fA54763abd0C3a0aa9', // Hardhat Signer 6
        ]);
    }
}
