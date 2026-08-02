<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class AdminDriverController extends Controller
{
    /**
     * List all driver users with optional search.
     */
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $limit = intval($request->query('limit', 100));
        $offset = intval($request->query('offset', 0));

        $query = User::where('role', 'driver');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%");
            });
        }

        $total = $query->count();
        $drivers = $query->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($limit)
            ->get();

        // Attach usage stats (number of assigned requests)
        foreach ($drivers as $driver) {
            $driver->assigned_requests_count = DB::table('requests')
                ->where('assigned_driver_id', $driver->id)
                ->count();
            if ($driver->avatar_data) {
                $driver->avatar_data = base64_encode(@iconv('UTF-8', 'UTF-8//IGNORE', $driver->avatar_data) ?: '');
            }
        }

        return response()->json([
            'data' => $drivers,
            'total' => $total,
        ]);
    }

    /**
     * Create a new driver account.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:120',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:30|regex:/^\+?[0-9](?:[0-9 ()\-]{5,29}[0-9])$/',
            'country' => 'nullable|string|max:80',
            'country_code' => 'nullable|string|max:8',
            'password' => 'nullable|string|min:6',
            'photo_url' => 'nullable|string|max:500',
        ]);

        // If no password provided, generate a random temporary one
        $password = $validated['password'] ?? Str::random(10);
        $passwordHash = Hash::make($password);

        // Handle photo if provided
        if (!empty($validated['photo_url'])) {
            $validated['photo_url'] = $this->normalizePhotoUrl($validated['photo_url']);
        }

        $driver = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'country' => $validated['country'] ?? null,
            'country_code' => $validated['country_code'] ?? null,
            'photo_url' => $validated['photo_url'] ?? null,
            'password_hash' => $passwordHash,
            'role' => 'driver',
            'is_blocked' => false,
        ]);

        return response()->json([
            'message' => 'Driver created successfully',
            'driver' => $driver,
            'temporary_password' => empty($validated['password']) ? $password : null,
        ], 201);
    }

    /**
     * Show a single driver.
     */
    public function show(Request $request, $id)
    {
        $driver = User::where('role', 'driver')->find($id);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $driver->assigned_requests_count = DB::table('requests')
            ->where('assigned_driver_id', $driver->id)
            ->count();
            
        if ($driver->avatar_data) {
            $driver->avatar_data = base64_encode(@iconv('UTF-8', 'UTF-8//IGNORE', $driver->avatar_data) ?: '');
        }

        return response()->json($driver);
    }

    /**
     * Update driver profile.
     */
    public function update(Request $request, $id)
    {
        $driver = User::where('role', 'driver')->find($id);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:120',
            'phone' => 'nullable|string|max:30|regex:/^\+?[0-9](?:[0-9 ()\-]{5,29}[0-9])$/',
            'country' => 'nullable|string|max:80',
            'country_code' => 'nullable|string|max:8',
            'photo_url' => 'nullable|string|max:500',
        ]);

        // Handle photo update
        if (!empty($validated['photo_url']) && $validated['photo_url'] !== $driver->photo_url) {
            $this->deleteOldPhoto($driver->photo_url);
            $validated['photo_url'] = $this->normalizePhotoUrl($validated['photo_url']);
        }

        $driver->update($validated);

        return response()->json([
            'message' => 'Driver updated successfully',
            'driver' => $driver,
        ]);
    }

    /**
     * Upload a photo for a driver (multipart upload)
     */
    public function uploadPhoto(Request $request, $id)
    {
        $driver = User::where('role', 'driver')->find($id);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $validated = $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png,gif,webp,avif|max:5120', // 5MB
        ]);

        $file = $request->file('photo');
        $extension = $file->getClientOriginalExtension();
        $filename = 'driver_' . $id . '_' . Str::random(8) . '.' . $extension;
        $path = $file->storeAs('uploads/photos', $filename, 'public');

        // Delete old photo
        $this->deleteOldPhoto($driver->photo_url);

        $photoUrl = '/storage/uploads/photos/' . $filename;
        $driver->update(['photo_url' => $photoUrl]);

        return response()->json([
            'success' => true,
            'message' => 'Photo uploaded successfully',
            'photo_url' => $photoUrl,
            'driver' => $driver,
        ]);
    }

    /**
     * Delete a driver's photo
     */
    public function deletePhoto(Request $request, $id)
    {
        $driver = User::where('role', 'driver')->find($id);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $this->deleteOldPhoto($driver->photo_url);
        $driver->update(['photo_url' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Photo deleted successfully',
            'driver' => $driver,
        ]);
    }

    /**
     * Permanently delete a driver account.
     */
    public function destroy(Request $request, $id)
    {
        $driver = User::where('role', 'driver')->find($id);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $usageCount = DB::table('requests')->where('assigned_driver_id', $driver->id)->count();
        if ($usageCount > 0) {
            return response()->json([
                'message' => "Cannot delete driver assigned to {$usageCount} active request(s). Unassign first or block the account.",
            ], 400);
        }

        // Delete photo file before deleting driver
        $this->deleteOldPhoto($driver->photo_url);
        $driver->delete();

        return response()->json(['message' => 'Driver deleted successfully']);
    }

    /**
     * Block / unblock a driver.
     */
    public function toggleBlock(Request $request, $id)
    {
        $driver = User::where('role', 'driver')->find($id);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $newState = !$driver->is_blocked;
        $driver->update(['is_blocked' => $newState]);

        return response()->json([
            'message' => "Driver " . ($newState ? 'blocked' : 'unblocked') . " successfully",
            'driverId' => $driver->id,
            'is_blocked' => $newState,
        ]);
    }

    /**
     * Generate a temporary password for a driver.
     */
    public function generateTempPassword(Request $request, $id)
    {
        $driver = User::where('role', 'driver')->find($id);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $expiryHours = intval(env('TEMP_PASSWORD_EXPIRY_HOURS', 24));
        $tempPassword = Str::random(12);
        $tempPasswordHash = Hash::make($tempPassword);

        $driver->update([
            'temp_password_hash' => $tempPasswordHash,
            'temp_password_expires_at' => Carbon::now()->addHours($expiryHours),
        ]);

        return response()->json([
            'message' => 'Temporary password generated successfully',
            'driverId' => $driver->id,
            'driverEmail' => $driver->email,
            'tempPassword' => $tempPassword,
            'expiresIn' => "{$expiryHours} hours",
        ]);
    }

    /**
     * List drivers available for assignment (only active, non-blocked drivers).
     * Used by the admin request detail page when shipping an order.
     */
    public function listAvailable(Request $request)
    {
        $drivers = User::where('role', 'driver')
            ->where('is_blocked', false)
            ->orderBy('full_name', 'asc')
            ->get(['id', 'full_name', 'email', 'phone', 'country', 'country_code', 'avatar_url', 'avatar_data', 'avatar_mime_type', 'photo_url']);

        foreach ($drivers as $driver) {
            $driver->avatar_data = $driver->avatar_data ? base64_encode(@iconv('UTF-8', 'UTF-8//IGNORE', $driver->avatar_data) ?: '') : null;
        }

        return response()->json([
            'data' => $drivers,
        ]);
    }

    /**
     * Normalize photo URL - if it's a base64 data URL, decode and save
     */
    private function normalizePhotoUrl($url)
    {
        // If it's already a URL (starts with http or /storage), return as-is
        if (preg_match('/^(https?:\/\/|\/storage\/)/', $url)) {
            return $url;
        }

        // If it's a base64 data URL, decode and save
        if (preg_match('/^data:image\/(\w+);base64,/', $url, $matches)) {
            $extension = $matches[1];
            $data = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $url));
            $filename = 'driver_' . Str::random(12) . '.' . $extension;
            Storage::disk('public')->put('uploads/photos/' . $filename, $data);
            return '/storage/uploads/photos/' . $filename;
        }

        return $url;
    }

    /**
     * Delete the old photo file from storage
     */
    private function deleteOldPhoto($url)
    {
        if (empty($url)) return;

        // Only delete local files, not external URLs
        if (preg_match('/^\/storage\/uploads\/photos\/(.+)$/', $url, $matches)) {
            $path = 'public/uploads/photos/' . $matches[1];
            if (Storage::exists($path)) {
                Storage::delete($path);
            }
        }
    }
}