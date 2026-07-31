<?php

namespace App\Http\Controllers;

use App\Models\Request as RFQRequest;
use App\Models\User;
use App\Models\Supplier;
use App\Models\TrackingLog;
use App\Models\EmailLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function getAdminRequests(Request $request)
    {
        $limit = intval($request->query('limit', 10));
        $cursor = $request->query('cursor');
        $statusFilter = $request->query('status');
        $page = $request->query('page');

        $query = RFQRequest::select('requests.*')
            ->join('users', 'requests.user_id', '=', 'users.id')
            ->leftJoin('suppliers', 'requests.assigned_supplier_id', '=', 'suppliers.id')
            ->selectRaw('users.full_name as buyer_name, users.company_name as buyer_company, suppliers.company_name as supplier_name');

        if ($statusFilter) {
            $query->where('requests.status', $statusFilter);
        }

        // Offset-based pagination fallback (legacy support)
        if ($page && !$cursor) {
            $page = intval($page);
            $offset = ($page - 1) * $limit;
            
            $total = $query->count();
            $data = $query->orderBy('requests.created_at', 'desc')->offset($offset)->limit($limit)->get();

            return response()->json([
                'data' => $data,
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);
        }

        // Keyset Cursor-Based Pagination
        if ($cursor) {
            if (str_contains($cursor, '|')) {
                [$cursorTime, $cursorId] = explode('|', $cursor);
                $query->where(function ($q) use ($cursorTime, $cursorId) {
                    $q->where('requests.created_at', '<', $cursorTime)
                      ->orWhere(function ($sub) use ($cursorTime, $cursorId) {
                          $sub->where('requests.created_at', '=', $cursorTime)
                              ->where('requests.id', '<', $cursorId);
                      });
                });
            } else {
                $query->where('requests.id', '<', $cursor);
            }
        }

        // Fetch limit + 1 to determine hasMore
        $result = $query->orderBy('requests.created_at', 'desc')
            ->orderBy('requests.id', 'desc')
            ->limit($limit + 1)
            ->get();

        $hasMore = $result->count() > $limit;
        $data = $hasMore ? $result->take($limit) : $result;

        $lastItem = $data->last();
        $nextCursor = null;
        if ($lastItem) {
            $nextCursor = $lastItem->created_at->toISOString() . '|' . $lastItem->id;
        }

        return response()->json([
            'data' => $data,
            'pagination' => [
                'nextCursor' => $nextCursor,
                'hasMore' => $hasMore,
                'limit' => $limit
            ]
        ]);
    }

    public function getAdminRequestById(Request $request, $id)
    {
        $rfq = RFQRequest::select('requests.*')
            ->join('users', 'requests.user_id', '=', 'users.id')
            ->leftJoin('suppliers', 'requests.assigned_supplier_id', '=', 'suppliers.id')
            ->selectRaw('users.full_name as buyer_name, users.company_name as buyer_company, users.email as buyer_email, suppliers.company_name as supplier_name, suppliers.verification_level, suppliers.factory_address')
            ->where('requests.id', $id)
            ->first();

        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        // Include options
        $rfq->options = $rfq->options()->orderBy('created_at', 'asc')->get();

        return response()->json($rfq);
    }

    public function updateAdminRequest(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'nullable|string',
            'assigned_supplier_id' => 'nullable|uuid',
            'quoted_price' => 'nullable|numeric',
            'internal_notes' => 'nullable|string',
            'production_progress' => 'nullable|integer',
        ]);

        if (isset($validated['assigned_supplier_id']) && $validated['assigned_supplier_id']) {
            $supplier = Supplier::find($validated['assigned_supplier_id']);
            if ($supplier && $supplier->is_blocked) {
                return response()->json(['message' => 'Cannot assign a blocked supplier to a request'], 400);
            }
        }

        $rfq->update($validated);

        if (isset($validated['status']) && $validated['status']) {
            TrackingLog::create([
                'request_id' => $rfq->id,
                'status' => $validated['status'],
                'notes' => 'Admin updated status',
            ]);
        }

        return response()->json($rfq);
    }

    public function generateTempPassword(Request $request, $userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $expiryHours = intval(env('TEMP_PASSWORD_EXPIRY_HOURS', 24));
        
        // Generate secure 12-char temp password
        $tempPassword = Str::random(12);
        $tempPasswordHash = Hash::make($tempPassword);

        $user->update([
            'temp_password_hash' => $tempPasswordHash,
            'temp_password_expires_at' => Carbon::now()->addHours($expiryHours),
        ]);

        return response()->json([
            'message' => 'Temporary password generated successfully',
            'userId' => $userId,
            'userEmail' => $user->email,
            'tempPassword' => $tempPassword,
            'expiresIn' => "{$expiryHours} hours"
        ]);
    }

    public function getAdminStatistics(Request $request)
    {
        $total = RFQRequest::count();
        $pending = RFQRequest::whereIn('status', [
            'menunggu_penawaran_admin', 
            'menunggu_pemilihan_buyer', 
            'menunggu_kesepakatan_final', 
            'menunggu_pembayaran', 
            'menunggu_verifikasi_pembayaran'
        ])->count();
        $processing = RFQRequest::whereIn('status', ['sedang_diproses', 'dikirim', 'menunggu_verifikasi_admin'])->count();
        $completed = RFQRequest::where('status', 'selesai')->count();
        
        $statusBreakdown = RFQRequest::select('status')
            ->selectRaw('count(*) as count')
            ->groupBy('status')
            ->get();

        $categoryBreakdown = RFQRequest::select('category')
            ->selectRaw('count(*) as count')
            ->groupBy('category')
            ->get();

        return response()->json([
            'total_requests' => $total,
            'pending_requests' => $pending,
            'processing_requests' => $processing,
            'completed_requests' => $completed,
            'statusBreakdown' => $statusBreakdown,
            'categoryBreakdown' => $categoryBreakdown,
            'avgResponseTime' => '24h'
        ]);
    }

    public function sendEmailToSupplier(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $supplier = $rfq->supplier;
        if (!$supplier || !$supplier->email) {
            return response()->json(['message' => 'Supplier email not found'], 400);
        }

        $validated = $request->validate([
            'subject' => 'required|string',
            'body' => 'required|string',
        ]);

        EmailLog::create([
            'request_id' => $id,
            'sender_id' => $request->user()->id,
            'receiver_email' => $supplier->email,
            'subject' => $validated['subject'],
            'body' => $validated['body'],
        ]);

        // Simulating actual mail send (in development we write to log)
        // Mail::raw($validated['body'], function($message) use ($supplier, $validated) {
        //     $message->to($supplier->email)->subject($validated['subject']);
        // });

        return response()->json(['message' => 'Email queued/sent successfully']);
    }

    public function uploadQCMedia(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $request->validate([
            'files.*' => 'required|file|mimes:jpeg,png,jpg,pdf|max:20480', // 20MB QC file limits
        ]);

        $mediaUrls = $rfq->production_media ?? [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('uploads', 'public');
                $mediaUrls[] = '/uploads/' . $path;
            }
        }

        if (count($mediaUrls) === 0) {
            return response()->json(['message' => 'No media files uploaded'], 400);
        }

        $rfq->update(['production_media' => $mediaUrls]);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'qc_update',
            'notes' => 'Admin uploaded new QC media',
        ]);

        return response()->json($rfq);
    }

    public function getBuyerList(Request $request)
    {
        $search = $request->query('search', '');
        $limit = intval($request->query('limit', 100));
        $offset = intval($request->query('offset', 0));

        $query = User::where('role', 'buyer');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        $total = $query->count();

        // Get buyer details along with last message using subquery
        $buyers = $query->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($limit)
            ->get();

        foreach ($buyers as $buyer) {
            $lastMsg = \App\Models\Message::where('sender_id', $buyer->id)
                ->orderBy('created_at', 'desc')
                ->first();
            $buyer->last_message = $lastMsg ? $lastMsg->content : null;
            $buyer->last_message_at = $lastMsg ? $lastMsg->created_at : null;
            // Add base64 encoded avatar data for direct display (UTF-8 safe)
            $buyer->avatar_data = $buyer->avatar_data ? base64_encode(@iconv('UTF-8', 'UTF-8//IGNORE', $buyer->avatar_data) ?: '') : null;
        }

        return response()->json([
            'data' => $buyers,
            'total' => $total
        ]);
    }

    public function getBuyerProfile(Request $request, $userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $totalOrders = RFQRequest::where('user_id', $userId)->count();
        $totalSpent = RFQRequest::where('user_id', $userId)
            ->where('status', 'selesai')
            ->sum('quoted_price');

        $recentActivities = RFQRequest::where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get(['id', 'product_name', 'status', 'created_at', 'updated_at']);

        return response()->json([
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'avatar_data' => $user->avatar_data ? base64_encode(@iconv('UTF-8', 'UTF-8//IGNORE', $user->avatar_data) ?: '') : null,
            'avatar_mime_type' => $user->avatar_mime_type,
            'company_name' => $user->company_name,
            'country' => $user->country,
            'country_code' => $user->country_code,
            'is_blocked' => $user->is_blocked,
            'created_at' => $user->created_at,
            'stats' => [
                'total_orders' => $totalOrders,
                'total_spent' => floatval($totalSpent),
                'joined_date' => $user->created_at
            ],
            'recent_activities' => $recentActivities
        ]);
    }

    public function toggleBlockUser(Request $request, $userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot block an admin user'], 400);
        }

        $newBlockedState = !$user->is_blocked;
        $user->update(['is_blocked' => $newBlockedState]);

        return response()->json([
            'message' => "User " . ($newBlockedState ? 'blocked' : 'unblocked') . " successfully",
            'userId' => $userId,
            'is_blocked' => $newBlockedState
        ]);
    }
}
