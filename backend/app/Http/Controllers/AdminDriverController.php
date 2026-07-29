<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
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
            'phone' => 'nullable|string|max:40',
            'country' => 'nullable|string|max:80',
            'country_code' => 'nullable|string|max:8',
            'password' => 'nullable|string|min:6',
        ]);

        // If no password provided, generate a random temporary one
        $password = $validated['password'] ?? Str::random(10);
        $passwordHash = Hash::make($password);

        $driver = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'country' => $validated['country'] ?? null,
            'country_code' => $validated['country_code'] ?? null,
            'password_hash' => $passwordHash,
            'role' => 'driver',
            'is_blocked' => false,
        ]);

        return response()->json([
            'message' => 'Driver created successfully',
            'driver' => $driver,
            'temporary_password' => $validated['password'] ? null : $password,
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
            'phone' => 'nullable|string|max:40',
            'country' => 'nullable|string|max:80',
            'country_code' => 'nullable|string|max:8',
        ]);

        $driver->update($validated);

        return response()->json([
            'message' => 'Driver updated successfully',
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
            ->get(['id', 'full_name', 'email', 'phone', 'country', 'country_code', 'avatar_url']);

        return response()->json([
            'data' => $drivers,
        ]);
    }
}