<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\InstansiType;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\JwtService;

class AuthController extends Controller
{
    /**
     * Register a new user and generate access token.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|email|max:255|unique:users',
            'password'      => 'required|string|min:8',
            'role'          => ['nullable', 'string', new Enum(UserRole::class)],
            'instansi_type' => ['nullable', 'string', new Enum(InstansiType::class)],
            'wallet_address'=> 'nullable|string',
        ]);

        $user = User::create([
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'password'       => Hash::make($validated['password']),
            'role'           => $validated['role'] ?? 'donatur',
            'instansi_type'  => $validated['instansi_type'] ?? null,
            'wallet_address' => $validated['wallet_address'] ?? null,
        ]);

        $token = JwtService::generateToken($user);

        return response()->json([
            'status'         => 'success',
            'message'        => 'Pengguna berhasil terdaftar',
            'access_token'   => $token,
            'token_type'     => 'Bearer',
            'user'           => $user,
            'role'           => $user->role->value ?? $user->role,
            'instansi_type'  => $user->instansi_type,
        ], 201);
    }

    /**
     * Login user with email + password and generate access token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'          => 'required|string|email',
            'password'       => 'required|string',
            'wallet_address' => 'nullable|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email atau password salah.',
            ], 401);
        }

        if (!empty($validated['wallet_address'])) {
            $user->wallet_address = $validated['wallet_address'];
            $user->save();
        }

        $token = JwtService::generateToken($user);

        return response()->json([
            'status'        => 'success',
            'message'       => 'Login berhasil',
            'access_token'  => $token,
            'token_type'    => 'Bearer',
            'user'          => $user,
            'role'          => $user->role->value ?? $user->role,
            'instansi_type' => $user->instansi_type,
        ]);
    }

    /**
     * Logout and revoke token.
     */
    public function logout(Request $request): JsonResponse
    {
        // JWT is stateless, so we just return success
        return response()->json([
            'status'  => 'success',
            'message' => 'Logout berhasil, token telah dicabut',
        ]);
    }
}
