<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatingController extends Controller
{
    public function createRating(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|uuid',
            'supplier_id' => 'required|uuid',
            'score' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string',
        ]);

        $buyerId = $request->user()->id;

        $existing = Rating::where('request_id', $validated['request_id'])
            ->where('buyer_id', $buyerId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already rated this request'], 400);
        }

        DB::beginTransaction();
        try {
            $rating = Rating::create([
                'request_id' => $validated['request_id'],
                'supplier_id' => $validated['supplier_id'],
                'buyer_id' => $buyerId,
                'score' => $validated['score'],
                'review' => $validated['review'] ?? null,
            ]);

            // Update supplier avg rating
            $avgScore = Rating::where('supplier_id', $validated['supplier_id'])->avg('score');
            Supplier::where('id', $validated['supplier_id'])->update(['avg_rating' => $avgScore]);

            // Create admin notifications
            $buyerName = $request->user()->full_name ?? 'Buyer';
            $supplier = Supplier::find($validated['supplier_id']);
            $supplierName = $supplier ? $supplier->company_name : 'Supplier';

            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'title' => 'New Rating Submitted',
                    'message' => "Buyer {$buyerName} rated Supplier {$supplierName} {$validated['score']} stars.",
                    'icon' => 'stars',
                    'path' => '/admin/ratings',
                ]);
            }

            DB::commit();
            return response()->json($rating, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function getRatingsBySupplier($supplierId)
    {
        $ratings = Rating::select('ratings.*', 'users.full_name as buyer_name', 'users.company_name as buyer_company')
            ->join('users', 'ratings.buyer_id', '=', 'users.id')
            ->where('ratings.supplier_id', $supplierId)
            ->orderBy('ratings.created_at', 'desc')
            ->get();

        return response()->json($ratings);
    }

    public function getRatingByRequest(Request $request, $requestId)
    {
        $rating = Rating::where('request_id', $requestId)
            ->where('buyer_id', $request->user()->id)
            ->first();

        return response()->json($rating);
    }

    public function getAllRatings()
    {
        $ratings = Rating::select('ratings.*', 'users.full_name as buyer_name', 'users.company_name as buyer_company')
            ->join('users', 'ratings.buyer_id', '=', 'users.id')
            ->orderBy('ratings.created_at', 'desc')
            ->get();

        return response()->json($ratings);
    }
}
