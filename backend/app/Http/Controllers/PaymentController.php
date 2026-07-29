<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Request as RFQRequest;
use App\Models\TrackingLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function uploadPaymentProof(Request $request, $requestId)
    {
        $request->validate([
            'payment_proof' => 'required|file|mimes:jpeg,png,jpg,pdf|max:10240', // 10MB
        ]);

        $rfq = RFQRequest::where('id', $requestId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($rfq->status !== 'menunggu_pembayaran' || !$rfq->deal_finalized_at) {
            return response()->json(['message' => 'Payment is not yet finalized by admin'], 400);
        }

        if ($request->file('payment_proof')) {
            $path = $request->file('payment_proof')->store('uploads', 'public');
            $proofUrl = '/uploads/' . $path;

            DB::beginTransaction();
            try {
                Payment::create([
                    'request_id' => $requestId,
                    'amount' => $rfq->quoted_price,
                    'currency' => $rfq->currency ?? 'USD',
                    'payment_proof_url' => $proofUrl,
                    'status' => 'pending',
                ]);

                $rfq->update([
                    'payment_proof_url' => $proofUrl,
                    'status' => 'menunggu_verifikasi_pembayaran',
                    'payment_rejection_reason' => null
                ]);

                TrackingLog::create([
                    'request_id' => $requestId,
                    'status' => 'menunggu_verifikasi_pembayaran',
                    'notes' => 'Buyer has uploaded payment proof to escrow',
                ]);

                DB::commit();
                return response()->json($rfq);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Failed to save payment: ' . $e->getMessage()], 500);
            }
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    public function verifyPayment(Request $request, $requestId)
    {
        $payment = Payment::where('request_id', $requestId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Pending payment not found for this request'], 404);
        }

        $rfq = RFQRequest::find($requestId);
        if (!$rfq || $rfq->status !== 'menunggu_verifikasi_pembayaran') {
            return response()->json(['message' => 'Request is not waiting for payment verification'], 400);
        }

        DB::beginTransaction();
        try {
            $payment->update([
                'status' => 'verified',
                'verified_by' => $request->user()->id,
                'verified_at' => Carbon::now(),
            ]);

            $rfq->update([
                'status' => 'sedang_diproses',
                'payment_rejection_reason' => null,
            ]);

            TrackingLog::create([
                'request_id' => $requestId,
                'status' => 'sedang_diproses',
                'notes' => 'Payment verified by Admin. Order is now in production/processing.',
            ]);

            DB::commit();
            return response()->json($rfq);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to verify payment: ' . $e->getMessage()], 500);
        }
    }

    public function rejectPayment(Request $request, $requestId)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $rfq = RFQRequest::find($requestId);
        if (!$rfq || $rfq->status !== 'menunggu_verifikasi_pembayaran') {
            return response()->json(['message' => 'Request is not waiting for payment verification'], 400);
        }

        DB::beginTransaction();
        try {
            Payment::where('request_id', $requestId)
                ->where('status', 'pending')
                ->update(['status' => 'rejected']);

            $rfq->update([
                'status' => 'menunggu_pembayaran',
                'payment_rejection_reason' => $request->input('reason'),
            ]);

            TrackingLog::create([
                'request_id' => $requestId,
                'status' => 'menunggu_pembayaran',
                'notes' => 'Payment proof rejected by Admin: ' . $request->input('reason'),
            ]);

            DB::commit();
            return response()->json($rfq);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to reject payment: ' . $e->getMessage()], 500);
        }
    }

    public function getBuyerPayments(Request $request, $requestId)
    {
        $rfq = RFQRequest::where('id', $requestId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $payments = Payment::where('request_id', $requestId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payments);
    }

    public function getAdminPayments(Request $request, $requestId)
    {
        $payments = Payment::where('request_id', $requestId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payments);
    }

    /**
     * Release escrow funds after order completion.
     * Only applicable to verified payments on completed orders.
     */
    public function release(Request $request, $requestId)
    {
        $payment = Payment::where('request_id', $requestId)
            ->where('status', 'verified')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Verified payment not found for this request'], 404);
        }

        $rfq = RFQRequest::find($requestId);
        if (!$rfq || $rfq->status !== 'selesai') {
            return response()->json(['message' => 'Request is not in completed status'], 400);
        }

        DB::beginTransaction();
        try {
            $payment->update([
                'status' => 'released',
                'notes' => $request->input('notes', 'Escrow released after order completion'),
            ]);

            TrackingLog::create([
                'request_id' => $requestId,
                'status' => 'selesai',
                'notes' => 'Escrow funds released to supplier.',
            ]);

            DB::commit();
            return response()->json(['message' => 'Escrow released successfully', 'payment' => $payment->fresh()]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to release escrow: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Refund a rejected payment back to the buyer.
     * Only applicable to rejected payments.
     */
    public function refund(Request $request, $requestId)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $payment = Payment::where('request_id', $requestId)
            ->where('status', 'rejected')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Rejected payment not found for this request'], 404);
        }

        $rfq = RFQRequest::find($requestId);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        DB::beginTransaction();
        try {
            $payment->update([
                'status' => 'refunded',
                'notes' => 'Refund processed: ' . $request->input('reason'),
            ]);

            TrackingLog::create([
                'request_id' => $requestId,
                'status' => $rfq->status,
                'notes' => 'Payment refund processed: ' . $request->input('reason'),
            ]);

            DB::commit();
            return response()->json(['message' => 'Refund processed successfully', 'payment' => $payment->fresh()]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to process refund: ' . $e->getMessage()], 500);
        }
    }
}
