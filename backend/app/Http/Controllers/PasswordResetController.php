<?php

namespace App\Http\Controllers;

use App\Models\PasswordResetRequest;
use App\Models\User;
use App\Models\Notification;
use App\Services\SocketService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    public function requestPasswordReset(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->where('role', 'buyer')->first();

        if (!$user) {
            // Leak prevention: always return success
            return response()->json([
                'message' => 'If an account with that email exists, your request has been submitted. Admin will process it shortly.'
            ]);
        }

        // Check if there is already a pending reset request
        $existing = PasswordResetRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$existing) {
            PasswordResetRequest::create([
                'user_id' => $user->id,
                'email' => $user->email,
                'status' => 'pending',
            ]);
        }

        // Notify admins via database and websockets
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'Password Reset Requested',
                'message' => "User {$user->full_name} requested a temporary password reset.",
                'icon' => 'lock_reset',
                'path' => '/admin/security/password-resets',
            ]);
        }

        SocketService::broadcast('new-notification', [
            'title' => 'Password Reset Requested',
            'message' => "User {$user->full_name} requested a temporary password reset.",
            'icon' => 'lock_reset',
            'path' => '/admin/security/password-resets',
        ]);

        return response()->json([
            'message' => 'Reset request submitted. Admin will process it shortly.'
        ]);
    }

    public function getResetRequests()
    {
        $requests = PasswordResetRequest::select('password_reset_requests.*', 'users.full_name', 'users.avatar_url')
            ->join('users', 'password_reset_requests.user_id', '=', 'users.id')
            ->where('password_reset_requests.status', 'pending')
            ->orderBy('password_reset_requests.created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    public function processResetRequest($requestId)
    {
        $resetRequest = PasswordResetRequest::where('id', $requestId)
            ->where('status', 'pending')
            ->first();

        if (!$resetRequest) {
            return response()->json(['message' => 'Reset request not found or already processed'], 404);
        }

        $user = User::find($resetRequest->user_id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $expiryHours = intval(env('TEMP_PASSWORD_EXPIRY_HOURS', 24));
        $tempPassword = Str::random(12);
        $tempPasswordHash = Hash::make($tempPassword);

        // Update user temporary fields
        $user->update([
            'temp_password_hash' => $tempPasswordHash,
            'temp_password_expires_at' => Carbon::now()->addHours($expiryHours),
        ]);

        // Mark request as processed
        $resetRequest->update([
            'status' => 'processed',
        ]);

        return response()->json([
            'message' => 'Temporary password generated successfully',
            'requestId' => $requestId,
            'userId' => $user->id,
            'userEmail' => $user->email,
            'userName' => $user->full_name,
            'tempPassword' => $tempPassword,
            'expiresIn' => "{$expiryHours} hours"
        ]);
    }

    /**
     * Reject a password reset request.
     */
    public function rejectResetRequest(Request $request, $requestId)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $resetRequest = PasswordResetRequest::where('id', $requestId)
            ->where('status', 'pending')
            ->first();

        if (!$resetRequest) {
            return response()->json(['message' => 'Reset request not found or already processed'], 404);
        }

        $user = User::find($resetRequest->user_id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        DB::beginTransaction();
        try {
            $resetRequest->update([
                'status' => 'rejected',
            ]);

            Notification::create([
                'user_id' => $user->id,
                'title' => 'Password Reset Request Rejected',
                'message' => 'Your password reset request was rejected. Reason: ' . $request->input('reason'),
                'icon' => 'cancel',
                'path' => '/settings',
            ]);

            SocketService::sendToUser($user->id, 'notification', [
                'title' => 'Password Reset Request Rejected',
                'message' => 'Your password reset request was rejected. Reason: ' . $request->input('reason'),
                'icon' => 'cancel',
                'path' => '/settings',
            ]);

            DB::commit();
            return response()->json(['message' => 'Reset request rejected', 'requestId' => $requestId]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to reject reset request: ' . $e->getMessage()], 500);
        }
    }
}
