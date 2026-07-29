<?php

namespace App\Http\Controllers;

use App\Models\Request as RFQRequest;
use App\Models\RequestOption;
use App\Models\TrackingLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BuyerRequestActionsController extends Controller
{
    public function selectOption(Request $request, $id)
    {
        $rfq = RFQRequest::where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($rfq->status !== 'menunggu_pemilihan_buyer') {
            return response()->json(['message' => 'Invalid status for selecting option'], 400);
        }

        $validated = $request->validate([
            'option_ids' => 'nullable|array',
            'option_ids.*' => 'uuid',
            'buyer_notes' => 'nullable|string',
            'direct_approval' => 'nullable|boolean',
        ]);

        $optionIds = $validated['option_ids'] ?? [];
        $buyerNotes = $validated['buyer_notes'] ?? null;
        $directApproval = $validated['direct_approval'] ?? false;

        DB::beginTransaction();
        try {
            if ($directApproval) {
                $status = 'menunggu_kesepakatan_final';
                $rfq->update([
                    'status' => $status,
                    'buyer_notes' => $buyerNotes ?? 'Buyer approved directly without selecting options.',
                ]);

                TrackingLog::create([
                    'request_id' => $rfq->id,
                    'status' => $status,
                    'notes' => 'Buyer gave direct approval (no option selected). Note: ' . ($buyerNotes ?? 'None'),
                ]);
            } elseif (count($optionIds) > 0) {
                RequestOption::whereIn('id', $optionIds)->update(['is_selected' => true]);

                $negStatus = 'menunggu_kesepakatan_final';
                $rfq->update([
                    'status' => $negStatus,
                    'buyer_notes' => $buyerNotes,
                ]);

                TrackingLog::create([
                    'request_id' => $rfq->id,
                    'status' => $negStatus,
                    'notes' => "Buyer selected " . count($optionIds) . " option(s). Note: " . ($buyerNotes ?? 'None'),
                ]);
            } else {
                $altStatus = 'menunggu_penawaran_admin';
                $rfq->update([
                    'status' => $altStatus,
                    'buyer_notes' => $buyerNotes,
                ]);

                TrackingLog::create([
                    'request_id' => $rfq->id,
                    'status' => $altStatus,
                    'notes' => "Buyer requested alternative options. Note: " . ($buyerNotes ?? 'None'),
                ]);
            }

            DB::commit();
            return response()->json($rfq);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function confirmDelivery(Request $request, $id)
    {
        $rfq = RFQRequest::where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($rfq->status !== 'dikirim') {
            return response()->json(['message' => 'Order is not yet shipped'], 400);
        }

        $rfq->update(['status' => 'menunggu_verifikasi_admin']);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'menunggu_verifikasi_admin',
            'notes' => 'Buyer confirmed physical delivery. Waiting for Admin verification.',
        ]);

        return response()->json($rfq);
    }

    public function cancelRequest(Request $request, $id)
    {
        $rfq = RFQRequest::where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        if (!in_array($rfq->status, ['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_kesepakatan_final'])) {
            return response()->json(['message' => 'Cannot cancel request at this stage'], 400);
        }

        $rfq->update(['status' => 'batal']);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'batal',
            'notes' => "Buyer Cancelled: " . $validated['reason'],
        ]);

        return response()->json($rfq);
    }

    public function disputeRequest(Request $request, $id)
    {
        $rfq = RFQRequest::where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        if (!in_array($rfq->status, ['dikirim', 'menunggu_verifikasi_admin'])) {
            return response()->json(['message' => 'Can only dispute when order is shipped or waiting for admin verification'], 400);
        }

        $rfq->update(['status' => 'dispute']);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'dispute',
            'notes' => "Buyer Disputed: " . $validated['reason'],
        ]);

        return response()->json($rfq);
    }
}
