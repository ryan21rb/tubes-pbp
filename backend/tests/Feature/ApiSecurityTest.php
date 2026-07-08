<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiSecurityTest extends TestCase
{
    /**
     * Uji apakah rute publik (tidak dilindungi JWT) dapat diakses dengan sukses.
     */
    public function test_public_endpoints_are_accessible_without_auth()
    {
        $response = $this->getJson('/api/v1/campaigns');

        // Harus sukses (200 OK) karena rute ini bersifat publik
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'data'
        ]);
    }

    /**
     * Uji apakah rute yang dilindungi menolak akses jika tidak mengirimkan JWT Token.
     */
    public function test_protected_endpoints_deny_access_without_jwt_token()
    {
        // Mencoba mengakses stats dashboard tanpa header Authorization JWT
        $response = $this->getJson('/api/v1/dashboard/stats');

        // Harus menolak (401 Unauthorized) karena middleware auth.jwt aktif
        $response->assertStatus(401);
    }

    /**
     * Uji apakah rute donasi menolak request jika tidak ada autentikasi token.
     */
    public function test_donation_requires_authentication()
    {
        $response = $this->postJson('/api/v1/donations', [
            'programId' => 1,
            'donateAmount' => 0.05
        ]);

        // Harus mengembalikan 401 karena tidak menyertakan JWT
        $response->assertStatus(401);
    }
}
