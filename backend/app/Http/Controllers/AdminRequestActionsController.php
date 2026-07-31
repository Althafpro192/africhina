<?php

namespace App\Http\Controllers;

use App\Models\Request as RFQRequest;
use App\Models\RequestOption;
use App\Models\TrackingLog;
use App\Models\Notification;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class AdminRequestActionsController extends Controller
{
    public function uploadRequestOptions(Request $request, $id)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'price_min' => 'nullable|numeric',
            'price_max' => 'nullable|numeric',
            'admin_reason' => 'required|string',
            'target_delivery' => 'nullable|date',
            'shipping_method' => 'nullable|string|max:50',
            'est_time_sea' => 'nullable|string|max:100',
            'est_time_air' => 'nullable|string|max:100',
            'is_fixed_price' => 'nullable|string',
            'images.*' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:10240', // 10MB per file
        ]);

        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if (!in_array($rfq->status, ['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer'])) {
            return response()->json(['message' => 'Cannot upload options at this stage'], 400);
        }

        // Store images as base64 in LONGBLOB
        $imageData = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $mimeType = $file->getMimeType();
                $base64 = 'data:' . $mimeType . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));
                $imageData[] = $base64;
            }
        }

        DB::beginTransaction();
        try {
            RequestOption::create([
                'request_id' => $id,
                'product_name' => $validated['product_name'],
                'description' => $validated['description'] ?? null,
                'image_url' => $imageData[0] ?? null,
                'images' => $imageData,
                'price_min' => $validated['price_min'] ?? null,
                'price_max' => $validated['price_max'] ?? null,
                'admin_reason' => $validated['admin_reason'],
                'target_delivery' => $validated['target_delivery'] ?? null,
                'shipping_method' => $validated['shipping_method'] ?? null,
                'est_time_sea' => $validated['est_time_sea'] ?? null,
                'est_time_air' => $validated['est_time_air'] ?? null,
                'is_fixed_price' => ($validated['is_fixed_price'] ?? 'false') === 'true',
            ]);

            $rfq->update(['status' => 'menunggu_pemilihan_buyer']);

            TrackingLog::create([
                'request_id' => $rfq->id,
                'status' => 'menunggu_pemilihan_buyer',
                'notes' => 'Admin has provided product options',
            ]);

            // Notify buyer
            Notification::create([
                'user_id' => $rfq->user_id,
                'title' => 'New Supplier Quote Received',
                'message' => "RFQ #{$rfq->id} for {$rfq->product_name} has received factory quotation options.",
                'icon' => 'request_quote',
                'path' => '/buyer/requests',
            ]);

            DB::commit();
            return response()->json($rfq);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed: ' . $e->getMessage()], 500);
        }
    }

    public function updateRequestOption(Request $request, $id, $optionId)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'price_min' => 'nullable|numeric',
            'price_max' => 'nullable|numeric',
            'admin_reason' => 'required|string',
            'target_delivery' => 'nullable|date',
            'shipping_method' => 'nullable|string|max:50',
            'est_time_sea' => 'nullable|string|max:100',
            'est_time_air' => 'nullable|string|max:100',
            'is_fixed_price' => 'nullable|string',
            'images.*' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:10240',
        ]);

        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $option = RequestOption::where('id', $optionId)->where('request_id', $id)->first();
        if (!$option) {
            return response()->json(['message' => 'Option not found'], 404);
        }

        $updateData = [
            'product_name' => $validated['product_name'],
            'description' => $validated['description'] ?? null,
            'price_min' => $validated['price_min'] ?? null,
            'price_max' => $validated['price_max'] ?? null,
            'admin_reason' => $validated['admin_reason'],
            'target_delivery' => $validated['target_delivery'] ?? null,
            'shipping_method' => $validated['shipping_method'] ?? null,
            'est_time_sea' => $validated['est_time_sea'] ?? null,
            'est_time_air' => $validated['est_time_air'] ?? null,
            'is_fixed_price' => ($validated['is_fixed_price'] ?? 'false') === 'true',
        ];

        if ($request->hasFile('images')) {
            $imageData = [];
            foreach ($request->file('images') as $file) {
                $mimeType = $file->getMimeType();
                $base64 = 'data:' . $mimeType . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));
                $imageData[] = $base64;
            }
            $updateData['image_url'] = $imageData[0] ?? null;
            $updateData['images'] = $imageData;
        }

        $option->update($updateData);

        return response()->json($option);
    }

    public function deleteRequestOption(Request $request, $id, $optionId)
    {
        $option = RequestOption::where('id', $optionId)->where('request_id', $id)->first();
        if (!$option) {
            return response()->json(['message' => 'Option not found'], 404);
        }

        $option->delete();

        return response()->json(['message' => 'Option deleted successfully']);
    }

    public function finalizeDeal(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $validated = $request->validate([
            'final_price' => 'nullable|numeric',
            'quoted_price' => 'nullable|numeric',
            'price_breakdown' => 'nullable|string',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:100',
            'bank_account_name' => 'nullable|string|max:100',
            'payment_notes' => 'nullable|string',
            'payment_qr' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:10240',
        ]);

        $paymentQrUrl = $rfq->payment_qr_url;
        if ($request->hasFile('payment_qr')) {
            $path = $request->file('payment_qr')->store('uploads', 'public');
            $paymentQrUrl = '/uploads/' . $path;
        }

        $priceToSet = $validated['final_price'] ?? $validated['quoted_price'] ?? null;
        
        $priceBreakdown = null;
        if (isset($validated['price_breakdown']) && $validated['price_breakdown']) {
            $decoded = json_decode($validated['price_breakdown'], true);
            $priceBreakdown = is_array($decoded) ? $decoded : $validated['price_breakdown'];
        }

        $rfq->update([
            'status' => 'menunggu_pembayaran',
            'deal_finalized_at' => Carbon::now(),
            'final_price' => $priceToSet,
            'quoted_price' => $priceToSet,
            'price_breakdown' => $priceBreakdown,
            'bank_name' => $validated['bank_name'] ?? null,
            'bank_account_number' => $validated['bank_account_number'] ?? null,
            'bank_account_name' => $validated['bank_account_name'] ?? null,
            'payment_qr_url' => $paymentQrUrl,
            'payment_notes' => $validated['payment_notes'] ?? null,
            'payment_rejection_reason' => null,
        ]);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'menunggu_pembayaran',
            'notes' => "Admin finalized deal with invoice amount USD {$priceToSet}. Waiting for buyer payment.",
        ]);

        // Notify buyer
        Notification::create([
            'user_id' => $rfq->user_id,
            'title' => 'Invoice Finalized - Awaiting Payment',
            'message' => "RFQ #{$rfq->id} for {$rfq->product_name} invoice is ready. Please make a payment.",
            'icon' => 'payments',
            'path' => '/buyer/requests',
        ]);

        return response()->json($rfq);
    }

    public function proceedToNegotiate(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($rfq->status !== 'menunggu_penawaran_admin') {
            return response()->json([
                'message' => 'Can only proceed from menunggu_penawaran_admin status. Current status: ' . $rfq->status
            ], 400);
        }

        $rfq->update(['status' => 'negosiasi']);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'negosiasi',
            'notes' => 'Admin decided to proceed directly to negotiation phase (without separate option quotation).',
        ]);

        // Notify buyer
        Notification::create([
            'user_id' => $rfq->user_id,
            'title' => 'Negotiation Phase Started',
            'message' => "RFQ #{$rfq->id} for {$rfq->product_name} has entered the negotiation phase. Admin will contact you for the final deal.",
            'icon' => 'handshake',
            'path' => '/buyer/requests',
        ]);

        return response()->json($rfq);
    }

    public function shipOrder(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $rfq->update(['status' => 'dikirim']);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'dikirim',
            'notes' => 'Order has been shipped.',
        ]);

        // Notify buyer
        Notification::create([
            'user_id' => $rfq->user_id,
            'title' => 'Logistics Update - Shipped',
            'message' => "Your order for {$rfq->product_name} (RFQ #{$rfq->id}) has been shipped.",
            'icon' => 'local_shipping',
            'path' => '/buyer/requests',
        ]);

        return response()->json($rfq);
    }

    public function completeOrder(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $rfq->update(['status' => 'selesai']);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'selesai',
            'notes' => 'Admin verified delivery. Order completed.',
        ]);

        return response()->json($rfq);
    }

    public function togglePublishRating(Request $request, $id)
    {
        $request->validate([
            'is_published' => 'required|boolean',
        ]);

        $rating = Rating::find($id);
        if (!$rating) {
            return response()->json(['message' => 'Rating not found'], 404);
        }

        $rating->update(['is_published' => $request->input('is_published')]);

        return response()->json($rating);
    }

    /**
     * Assign a driver (or trusted provider) to a request.
     *
     * Body:
     *  - delivery_method: 'sea' | 'air' | 'trusted_provider' (required)
     *  - assigned_driver_id: required only when delivery_method is 'sea' or 'air'.
     *                         Ignored (and un-assigned) when 'trusted_provider'.
     */
    public function assignDriver(Request $request, $id)
    {
        $validated = $request->validate([
            'delivery_method'      => 'required|in:sea,air,trusted_provider',
            'assigned_driver_id'   => 'nullable|string|exists:users,id',
        ]);

        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        // Status guard: only allow assignment once payment is verified or
        // order is in-process / shipped / awaiting verification.
        $allowedStatuses = [
            'menunggu_pembayaran',
            'sedang_diproses',
            'dikirim',
            'menunggu_verifikasi_admin',
        ];
        if (!in_array($rfq->status, $allowedStatuses)) {
            return response()->json([
                'message' => 'Driver assignment not allowed at this stage. Current status: ' . $rfq->status,
            ], 400);
        }

        $deliveryMethod = $validated['delivery_method'];

        // If a real driver is requested, validate that the user actually has
        // the driver role and is not blocked.
        if ($deliveryMethod !== 'trusted_provider') {
            if (empty($validated['assigned_driver_id'])) {
                return response()->json([
                    'message' => 'A driver must be selected for sea/air delivery.',
                ], 422);
            }

            $driver = User::where('id', $validated['assigned_driver_id'])
                ->where('role', 'driver')
                ->first();
            if (!$driver) {
                return response()->json(['message' => 'Selected user is not a driver.'], 422);
            }
            if (!empty($driver->is_blocked)) {
                return response()->json(['message' => 'Selected driver is currently blocked.'], 422);
            }
        }

        $driverId = $deliveryMethod === 'trusted_provider'
            ? null
            : $validated['assigned_driver_id'];

        $rfq->update([
            'assigned_driver_id' => $driverId,
            'delivery_method'    => $deliveryMethod,
            'assigned_driver_at' => Carbon::now(),
        ]);

        $methodLabel = match ($deliveryMethod) {
            'sea'              => 'Sea Freight',
            'air'              => 'Air Freight',
            'trusted_provider' => 'Trusted Provider',
        };

        $notes = $deliveryMethod === 'trusted_provider'
            ? 'Delivery assigned to trusted provider (no specific driver).'
            : "Delivery assigned: {$methodLabel} via driver " .
              optional(User::find($driverId))->name . ' (' . $driverId . ').';

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status'     => $rfq->status,
            'notes'      => $notes,
        ]);

        // Notify buyer
        if ($deliveryMethod === 'trusted_provider') {
            $message = "Delivery for RFQ #{$rfq->id} will be handled by our trusted provider.";
        } else {
            $driver = User::find($driverId);
            $message = "Driver " . ($driver->name ?? 'assigned') . " will deliver your order for RFQ #{$rfq->id} via {$methodLabel}.";
        }
        Notification::create([
            'user_id' => $rfq->user_id,
            'title'   => 'Delivery Assigned',
            'message' => $message,
            'icon'    => 'local_shipping',
            'path'    => '/buyer/requests',
        ]);

        // Notify driver (if real driver)
        if ($driverId) {
            Notification::create([
                'user_id' => $driverId,
                'title'   => 'New Delivery Assignment',
                'message' => "You have been assigned to deliver RFQ #{$rfq->id} ({$rfq->product_name}) via {$methodLabel}.",
                'icon'    => 'local_shipping',
                'path'    => '/driver/messages',
            ]);
        }

        $rfq->refresh();
        return response()->json($rfq);
    }
}
