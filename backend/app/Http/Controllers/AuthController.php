<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function registerSupplier(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'required|string|max:200',
            'category' => 'nullable|string|max:50',
            'factory_address' => 'nullable|string',
            'business_license' => 'nullable|string|max:100',
        ]);

        // Create user with supplier role
        $user = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company_name'] ?? null,
            'role' => 'supplier',
        ]);

        // Create associated supplier profile
        Supplier::create([
            'user_id' => $user->id,
            'company_name' => $validated['company_name'],
            'category' => $validated['category'] ?? null,
            'contact_person' => $validated['full_name'],
            'phone_china' => $validated['phone'] ?? null,
            'email' => $validated['email'],
            'factory_address' => $validated['factory_address'] ?? null,
            'verification_level' => 'pending',
        ]);

        return response()->json([
            'message' => 'Supplier registration submitted successfully. Your account is pending verification.',
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 201);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
            'country' => 'nullable|string|max:50',
            'country_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'country' => $validated['country'] ?? null,
            'country_code' => $validated['country_code'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company_name'] ?? null,
            'role' => 'buyer',
        ]);

        return response()->json(['user' => [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'role' => $user->role,
        ]], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 400);
        }

        $isTempPasswordLogin = false;

        // 1. Check permanent password
        if (Hash::check($validated['password'], $user->password_hash)) {
            $isTempPasswordLogin = false;
        } else {
            // 2. Check temporary password
            if ($user->temp_password_hash && $user->temp_password_expires_at) {
                $isExpired = Carbon::parse($user->temp_password_expires_at)->isPast();
                if (!$isExpired && Hash::check($validated['password'], $user->temp_password_hash)) {
                    $isTempPasswordLogin = true;
                }
            }

            if (!$isTempPasswordLogin) {
                return response()->json(['message' => 'Invalid credentials'], 400);
            }
        }

        $abilities = $isTempPasswordLogin ? ['must-change-password'] : ['*'];
        $token = $user->createToken('auth-token', $abilities)->plainTextToken;

        // Set HttpOnly cookie for token to match front-end legacy flow
        $isSecure = app()->environment('production') || request()->secure();
        $cookie = cookie('token', $token, 24 * 60, null, null, $isSecure, true, false, 'Lax');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
                'mustChangePassword' => $isTempPasswordLogin,
            ],
            'token' => $token,
        ])->withCookie($cookie);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        $cookie = Cookie::forget('token');

        return response()->json(['message' => 'Logged out successfully'])->withCookie($cookie);
    }

    public function getMe(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $abilities = $user->currentAccessToken()->abilities ?? [];
        $mustChangePassword = in_array('must-change-password', $abilities) && !in_array('*', $abilities);

        return response()->json([
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'country' => $user->country,
            'country_code' => $user->country_code,
            'phone' => $user->phone,
            'company_name' => $user->company_name,
            'role' => $user->role,
            'avatar_url' => $user->avatar_url,
            'avatar_data' => $user->avatar_data ? base64_encode($user->avatar_data) : null,
            'avatar_mime_type' => $user->avatar_mime_type,
            'mustChangePassword' => $mustChangePassword,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:100',
            'company_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'country_code' => 'nullable|string|max:10',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'country' => $user->country,
                'country_code' => $user->country_code,
                'phone' => $user->phone,
                'company_name' => $user->company_name,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
                'avatar_data' => $user->avatar_data ? base64_encode($user->avatar_data) : null,
                'avatar_mime_type' => $user->avatar_mime_type,
            ]
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'newPassword' => 'required|string|min:6',
        ]);

        // Clear temporary fields and update permanent password hash
        $user->update([
            'password_hash' => Hash::make($validated['newPassword']),
            'temp_password_hash' => null,
            'temp_password_expires_at' => null,
        ]);

        // Revoke the old token and issue a new one without 'must-change-password' constraint
        $user->tokens()->delete();
        $newToken = $user->createToken('auth-token', ['*'])->plainTextToken;

        $isSecure = app()->environment('production') || request()->secure();
        $cookie = cookie('token', $newToken, 24 * 60, null, null, $isSecure, true, false, 'Lax');

        return response()->json([
            'message' => 'Password changed successfully',
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
                'mustChangePassword' => false,
            ],
            'token' => $newToken,
        ])->withCookie($cookie);
    }

    public function uploadAvatar(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $request->validate([
            'avatar' => 'required|image|max:5120', // max 5MB
        ]);

        if ($request->file('avatar')) {
            $file = $request->file('avatar');
            
            // Read file content as binary data
            $avatarData = file_get_contents($file->getRealPath());
            $mimeType = $file->getMimeType();
            
            // Update user with avatar data stored in database
            $user->update([
                'avatar_data' => $avatarData,
                'avatar_mime_type' => $mimeType,
                // Keep avatar_url for backward compatibility, point to our API endpoint
                'avatar_url' => '/api/avatars/' . $user->id,
            ]);

            return response()->json([
                'message' => 'Avatar updated successfully',
                'avatar_url' => '/api/avatars/' . $user->id,
                'avatar_data' => $user->avatar_data ? base64_encode($user->avatar_data) : null,
                'avatar_mime_type' => $user->avatar_mime_type,
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Get avatar image from database by user ID.
     */
    public function getAvatar($userId)
    {
        $user = User::find($userId);
        
        if (!$user || !$user->avatar_data) {
            return response()->json(['message' => 'Avatar not found'], 404);
        }

        return response($user->avatar_data, 200)
            ->header('Content-Type', $user->avatar_mime_type ?? 'image/png')
            ->header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    }
}
