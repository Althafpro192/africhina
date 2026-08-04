<?php

namespace App\Http\Controllers;

use App\Models\Request as RFQRequest;
use App\Models\TrackingLog;
use Illuminate\Http\Request;

class BuyerRequestActionsController extends Controller
{
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

        if (!in_array($rfq->status, ['menunggu_penawaran_admin', 'menunggu_kesepakatan_final'])) {
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
