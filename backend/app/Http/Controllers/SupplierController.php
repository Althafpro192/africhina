<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\Request as RFQRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SupplierController extends Controller
{
    public function getSuppliers(Request $request)
    {
        $page = $request->query('page');
        $limit = intval($request->query('limit', 100));

        $query = Supplier::select('suppliers.*')
            ->selectRaw('(SELECT COUNT(*) FROM requests r WHERE r.assigned_supplier_id = suppliers.id) as usage_count');

        if ($page) {
            $page = intval($page);
            $offset = ($page - 1) * $limit;
            $total = Supplier::count();
            
            $data = $query->orderBy('suppliers.created_at', 'desc')->offset($offset)->limit($limit)->get();

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

        $suppliers = $query->orderBy('created_at', 'desc')->get();
        return response()->json($suppliers);
    }

    public function getSupplierById($id)
    {
        $supplier = Supplier::select('suppliers.*')
            ->selectRaw('(SELECT COUNT(*) FROM requests r WHERE r.assigned_supplier_id = suppliers.id) as usage_count')
            ->where('id', $id)
            ->first();

        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        return response()->json($supplier);
    }

    public function createSupplier(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:200',
            'category' => 'nullable|string|max:50',
            'contact_person' => 'nullable|string|max:100',
            'phone_china' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'factory_address' => 'nullable|string',
            'verification_level' => 'nullable|string|max:20',
            'logo_url' => 'nullable|string|max:500',
            'notes' => 'nullable|string',
        ]);

        // If logo_url is a base64 data URL or uploaded file path, normalize it
        if (!empty($validated['logo_url'])) {
            $validated['logo_url'] = $this->normalizeLogoUrl($validated['logo_url']);
        }

        $supplier = Supplier::create($validated);
        return response()->json($supplier, 201);
    }

    public function updateSupplier(Request $request, $id)
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        $validated = $request->validate([
            'company_name' => 'nullable|string|max:200',
            'category' => 'nullable|string|max:50',
            'contact_person' => 'nullable|string|max:100',
            'phone_china' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'factory_address' => 'nullable|string',
            'verification_level' => 'nullable|string|max:20',
            'logo_url' => 'nullable|string|max:500',
            'notes' => 'nullable|string',
        ]);

        // Handle logo update: if new logo provided, delete old one
        if (!empty($validated['logo_url']) && $validated['logo_url'] !== $supplier->logo_url) {
            $this->deleteOldLogo($supplier->logo_url);
            $validated['logo_url'] = $this->normalizeLogoUrl($validated['logo_url']);
        }

        // Filter null values so they fall back to existing values
        $filtered = array_filter($validated, fn($val) => !is_null($val));
        $supplier->update($filtered);

        return response()->json($supplier);
    }

    /**
     * Upload a logo for a supplier (multipart upload)
     */
    public function uploadLogo(Request $request, $id)
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        $validated = $request->validate([
            'logo' => 'required|image|mimes:jpeg,jpg,png,gif,svg,webp,avif|max:5120', // 5MB
        ]);

        $file = $request->file('logo');
        $extension = $file->getClientOriginalExtension();
        $filename = 'supplier_' . $id . '_' . Str::random(8) . '.' . $extension;
        $path = $file->storeAs('uploads/logos', $filename, 'public');

        // Delete old logo
        $this->deleteOldLogo($supplier->logo_url);

        $logoUrl = '/storage/uploads/logos/' . $filename;
        $supplier->update(['logo_url' => $logoUrl]);

        return response()->json([
            'success' => true,
            'message' => 'Logo uploaded successfully',
            'logo_url' => $logoUrl,
            'supplier' => $supplier,
        ]);
    }

    /**
     * Delete a supplier's logo
     */
    public function deleteLogo(Request $request, $id)
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        $this->deleteOldLogo($supplier->logo_url);
        $supplier->update(['logo_url' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Logo deleted successfully',
            'supplier' => $supplier,
        ]);
    }

    public function toggleBlockSupplier($id)
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        $newBlockedState = !$supplier->is_blocked;
        $supplier->update(['is_blocked' => $newBlockedState]);

        return response()->json([
            'message' => $newBlockedState ? 'Supplier blocked successfully' : 'Supplier unblocked successfully',
            'action' => $newBlockedState ? 'blocked' : 'unblocked',
            'is_blocked' => $newBlockedState,
            'supplier' => $supplier
        ]);
    }

    public function deleteSupplier($id)
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        $usageCount = RFQRequest::where('assigned_supplier_id', $id)->count();

        if ($usageCount > 0) {
            $supplier->update(['is_blocked' => true]);
            return response()->json([
                'message' => 'Supplier has transaction history with buyers and was blocked instead of deleted.',
                'action' => 'blocked',
                'is_blocked' => true,
                'supplier' => $supplier
            ]);
        } else {
            // Delete logo file before deleting supplier
            $this->deleteOldLogo($supplier->logo_url);
            $supplier->delete();
            return response()->json([
                'message' => 'Supplier deleted successfully',
                'action' => 'deleted'
            ]);
        }
    }

    /**
     * Normalize logo URL - if it's a base64 data URL, upload it and return the URL
     */
    private function normalizeLogoUrl($url)
    {
        // If it's already a URL (starts with http or /storage), return as-is
        if (preg_match('/^(https?:\/\/|\/storage\/)/', $url)) {
            return $url;
        }

        // If it's a base64 data URL, decode and save
        if (preg_match('/^data:image\/(\w+);base64,/', $url, $matches)) {
            $extension = $matches[1];
            $data = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $url));
            $filename = 'supplier_' . Str::random(12) . '.' . $extension;
            Storage::disk('public')->put('uploads/logos/' . $filename, $data);
            return '/storage/uploads/logos/' . $filename;
        }

        return $url;
    }

    /**
     * Delete the old logo file from storage
     */
    private function deleteOldLogo($url)
    {
        if (empty($url)) return;

        // Only delete local files, not external URLs
        if (preg_match('/^\/storage\/uploads\/logos\/(.+)$/', $url, $matches)) {
            $path = 'public/uploads/logos/' . $matches[1];
            if (Storage::exists($path)) {
                Storage::delete($path);
            }
        }
    }
}