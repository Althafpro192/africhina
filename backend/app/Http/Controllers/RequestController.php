<?php

namespace App\Http\Controllers;

use App\Models\Request as RFQRequest;
use App\Models\TrackingLog;
use App\Models\Notification;
use App\Models\Message;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class RequestController extends Controller
{
    public function createRequest(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'sometimes|required|string|max:200',
            'category' => 'sometimes|required|string|max:50',
            'specifications' => 'nullable|string',
            'quantity' => 'sometimes|required|integer|min:1',
            'budget_range' => 'sometimes|required|string|max:50',
            'sub_category' => 'nullable|string|max:100',
            'unit' => 'nullable|string|max:50',
            'currency' => 'nullable|string|max:20',
            'delivery_timeline' => 'nullable|date|after_or_equal:today',
            'shipping_terms' => 'sometimes|required|string|max:50',
            'payment_terms' => 'sometimes|required|string|max:50',
            'quality_requirements' => 'nullable|string',
            'certifications' => 'nullable|string',
        ]);

        // Handle images - accept both file uploads and pre-uploaded URLs
        $imageData = [];
        $files = $request->allFiles();
        
        // Handle file uploads (actual files)
        if (isset($files['images']) && is_array($files['images'])) {
            foreach ($files['images'] as $file) {
                if ($file && $file->isValid()) {
                    $mimeType = $file->getMimeType();
                    $base64 = 'data:' . $mimeType . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));
                    $imageData[] = $base64;
                }
            }
        }
        
        // Handle 'images[]' array (from frontend formData)
        if (isset($files['images[]']) && is_array($files['images[]'])) {
            foreach ($files['images[]'] as $file) {
                if ($file && $file->isValid()) {
                    $mimeType = $file->getMimeType();
                    $base64 = 'data:' . $mimeType . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));
                    $imageData[] = $base64;
                }
            }
        }
        
        // Handle pre-uploaded URLs (strings from frontend after file upload)
        $imageUrls = $request->input('images');
        if (is_string($imageUrls)) {
            $imageUrls = [$imageUrls];
        }
        if (is_array($imageUrls)) {
            foreach ($imageUrls as $url) {
                if (is_string($url) && !empty($url)) {
                    // Accept both storage URLs and base64 data URLs
                    if (str_starts_with($url, '/storage/') || str_starts_with($url, '/uploads/')) {
                        // Convert storage path to full URL for display
                        $imageData[] = $url;
                    } elseif (str_starts_with($url, 'data:') || str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                        $imageData[] = $url;
                    }
                }
            }
        }
        
        // Handle 'images[]' string array (from formData.append('images[]', url))
        $imageUrlsArray = $request->input('images[]');
        if (is_string($imageUrlsArray)) {
            $imageUrlsArray = [$imageUrlsArray];
        }
        if (is_array($imageUrlsArray)) {
            foreach ($imageUrlsArray as $url) {
                if (is_string($url) && !empty($url)) {
                    if (str_starts_with($url, '/storage/') || str_starts_with($url, '/uploads/')) {
                        $imageData[] = $url;
                    } elseif (str_starts_with($url, 'data:') || str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                        $imageData[] = $url;
                    }
                }
            }
        }

        $rfq = RFQRequest::create([
            'user_id' => $request->user()->id,
            'product_name' => $validated['product_name'],
            'category' => $validated['category'],
            'specifications' => $validated['specifications'] ?? null,
            'quantity' => $validated['quantity'],
            'budget_range' => $validated['budget_range'],
            'sub_category' => $validated['sub_category'] ?? null,
            'unit' => $validated['unit'] ?? 'units',
            'currency' => $validated['currency'] ?? 'USD',
            'delivery_timeline' => $validated['delivery_timeline'] ?? null,
            'shipping_terms' => $validated['shipping_terms'],
            'payment_terms' => $validated['payment_terms'],
            'quality_requirements' => $validated['quality_requirements'] ?? null,
            'certifications' => $validated['certifications'] ?? null,
            'image_urls' => $imageData, // Store as array of base64 data URLs
            'status' => 'menunggu_penawaran_admin',
        ]);

        // Add tracking log
        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'menunggu_penawaran_admin',
            'notes' => 'RFQ submitted by buyer. Awaiting admin review and quotations.',
        ]);

        // Notify admins in database
        $admins = \App\Models\User::where('role', 'admin')->get();
        $buyerName = $request->user()->full_name ?? 'A buyer';
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'New RFQ Submitted',
                'message' => "{$buyerName} submitted RFQ for {$rfq->product_name}.",
                'icon' => 'request_quote',
                'path' => '/admin/dashboard',
            ]);
        }

        return response()->json(['message' => 'Request created successfully', 'request' => $rfq], 201);
    }

    public function getBuyerRequests(Request $request)
    {
        // Exclude heavy base64 columns (image_urls, production_media) from
        // the SELECT itself. The rows carry 100s of KB of inline base64, and
        // loading them in the LIST endpoint makes MySQL exceed its tiny
        // sort_buffer_size (256KB default) on ORDER BY created_at, raising
        // SQLSTATE[HY001] Out of sort memory. The detail endpoint still loads
        // them via getRequestDetail().
        //
        // NOTE: Column list is the EXACT set declared in the `requests`
        // CREATE TABLE from africhina.sql (37 columns). The model's
        // $fillable contains a few extra fields (delivery_method,
        // assigned_driver_at, assigned_driver_id) which are NOT present in
        // the live schema, so requesting them raises "Unknown column"
        // and breaks the entire endpoint.
        $requests = RFQRequest::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get([
                'id', 'user_id', 'product_name', 'category', 'specifications',
                'quantity', 'budget_range', 'sub_category', 'unit', 'currency',
                'delivery_timeline', 'shipping_terms', 'payment_terms',
                'quality_requirements', 'certifications', 'status',
                'assigned_supplier_id', 'quoted_price', 'quote_accepted_at',
                'production_progress', 'estimated_arrival_date',
                'internal_notes', 'deal_finalized_at', 'payment_proof_url',
                'buyer_notes', 'final_price', 'price_breakdown',
                'bank_name', 'bank_account_number', 'bank_account_name',
                'payment_qr_url', 'payment_notes',
                'payment_rejection_reason',
                'created_at', 'updated_at',
            ]);

        return response()->json($requests);
    }

    public function getRequestDetail(Request $request, $id)
    {
        $rfq = RFQRequest::with(['options', 'trackingLogs', 'messages.sender', 'rating'])->find($id);

        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        // Authorization check: only request owner or admin can view
        if ($request->user()->role !== 'admin' && $rfq->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        // Return structured detail
        return response()->json($rfq);
    }

    public function getTrackingLogs(Request $request, $id)
    {
        $logs = TrackingLog::where('request_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();
            
        return response()->json($logs);
    }

    public function editRequest(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($rfq->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($rfq->status, ['menunggu_penawaran_admin', 'menunggu_pilihan_buyer'])) {
            return response()->json(['message' => 'Cannot edit request at this stage'], 400);
        }

        $validated = $request->validate([
            'product_name' => 'sometimes|required|string|max:200',
            'category' => 'sometimes|required|string|max:50',
            'sub_category' => 'nullable|string|max:100',
            'specifications' => 'nullable|string',
            'quality_requirements' => 'nullable|string',
            'certifications' => 'nullable|string',
            'quantity' => 'sometimes|required|integer|min:1',
            'unit' => 'nullable|string|max:50',
            'budget_range' => 'sometimes|required|string|max:50',
            'target_delivery' => 'nullable|date',
            'shipping_terms' => 'sometimes|required|string|max:50',
            'payment_terms' => 'sometimes|required|string|max:50',
            'images' => 'nullable|array',
            'images.*' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:10240',
        ]);

        $imageData = $rfq->image_urls ?? [];
        $hasNewImages = $request->hasFile('images');
        $hasNewUrls = $request->input('images') || $request->input('images[]');
        
        // Check if we should keep existing images
        if ($request->input('keep_images') === 'true' && !$hasNewImages && !$hasNewUrls) {
            // Keep existing images - do nothing
        } else if ($hasNewImages) {
            // Replace existing images with new ones - store as base64
            $imageData = [];
            foreach ($request->file('images') as $file) {
                $mimeType = $file->getMimeType();
                $base64 = 'data:' . $mimeType . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));
                $imageData[] = $base64;
            }
        } else if ($hasNewUrls) {
            // Handle URL strings from frontend
            $imageData = [];
            
            // Handle 'images' array
            $imageUrls = $request->input('images');
            if (is_string($imageUrls)) {
                $imageUrls = [$imageUrls];
            }
            if (is_array($imageUrls)) {
                foreach ($imageUrls as $url) {
                    if (is_string($url) && !empty($url)) {
                        if (str_starts_with($url, '/storage/') || str_starts_with($url, '/uploads/')) {
                            $imageData[] = $url;
                        } elseif (str_starts_with($url, 'data:') || str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                            $imageData[] = $url;
                        }
                    }
                }
            }
            
            // Handle 'images[]' array
            $imageUrlsArray = $request->input('images[]');
            if (is_string($imageUrlsArray)) {
                $imageUrlsArray = [$imageUrlsArray];
            }
            if (is_array($imageUrlsArray)) {
                foreach ($imageUrlsArray as $url) {
                    if (is_string($url) && !empty($url)) {
                        if (str_starts_with($url, '/storage/') || str_starts_with($url, '/uploads/')) {
                            $imageData[] = $url;
                        } elseif (str_starts_with($url, 'data:') || str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                            $imageData[] = $url;
                        }
                    }
                }
            }
        }

        $rfq->update([
            'product_name' => $validated['product_name'],
            'category' => $validated['category'],
            'sub_category' => $validated['sub_category'] ?? null,
            'specifications' => $validated['specifications'],
            'quality_requirements' => $validated['quality_requirements'],
            'certifications' => $validated['certifications'] ?? null,
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'] ?? 'units',
            'budget_range' => $validated['budget_range'],
            'delivery_timeline' => $validated['delivery_timeline'] ?? null,
            'shipping_terms' => $validated['shipping_terms'],
            'payment_terms' => $validated['payment_terms'],
            'image_urls' => $imageData,
        ]);

        return response()->json(['message' => 'Request updated successfully', 'request' => $rfq]);
    }

    public function cancelRequest(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($rfq->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($rfq->status, ['menunggu_penawaran_admin', 'menunggu_pemilihan_buyer', 'menunggu_kesepakatan_final'])) {
            return response()->json(['message' => 'Cannot cancel request at this stage'], 400);
        }

        $rfq->update(['status' => 'batal']);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'batal',
            'notes' => 'Request cancelled by buyer.',
        ]);

        return response()->json(['message' => 'Request cancelled successfully', 'request' => $rfq]);
    }

    public function disputeRequest(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($rfq->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($rfq->status, ['dikirim', 'menunggu_verifikasi_admin'])) {
            return response()->json(['message' => 'Cannot dispute request at this stage'], 400);
        }

        $request->validate(['reason' => 'required|string']);

        $rfq->update(['status' => 'dispute']);

        TrackingLog::create([
            'request_id' => $rfq->id,
            'status' => 'dispute',
            'notes' => 'Buyer filed a dispute/complaint: ' . $request->input('reason'),
        ]);

        return response()->json(['message' => 'Dispute registered successfully', 'request' => $rfq]);
    }

    public function uploadPaymentProof(Request $request, $id)
    {
        $rfq = RFQRequest::find($id);
        if (!$rfq) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($rfq->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($rfq->status !== 'menunggu_pembayaran') {
            return response()->json(['message' => 'Cannot upload payment proof at this stage'], 400);
        }

        $request->validate([
            'proof' => 'required|file|mimes:jpeg,png,jpg,pdf|max:10240', // 10MB
        ]);

        if ($request->file('proof')) {
            $path = $request->file('proof')->store('uploads', 'public');
            $proofUrl = '/storage/' . $path;

            $rfq->update([
                'payment_proof_url' => $proofUrl,
                'status' => 'menunggu_verifikasi_pembayaran',
                'payment_rejection_reason' => null // reset rejection reason if re-uploaded
            ]);

            TrackingLog::create([
                'request_id' => $rfq->id,
                'status' => 'menunggu_verifikasi_pembayaran',
                'notes' => 'Buyer uploaded payment proof. Awaiting admin verification.',
            ]);

            // Notify admins
            $admins = \App\Models\User::where('role', 'admin')->get();
            $buyerName = $request->user()->full_name ?? 'A buyer';
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'title' => 'Payment Proof Uploaded',
                    'message' => "{$buyerName} uploaded payment proof for RFQ #{$rfq->id}.",
                    'icon' => 'receipt_long',
                    'path' => '/admin/dashboard',
                ]);
            }

            return response()->json(['message' => 'Payment proof uploaded successfully', 'request' => $rfq]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }
}
