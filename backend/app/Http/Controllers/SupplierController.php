<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\Request as RFQRequest;
use Illuminate\Http\Request;

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
        ]);

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
            'notes' => 'nullable|string',
        ]);

        // Filter null values so they fall back to existing values (replicating COALESCE)
        $filtered = array_filter($validated, fn($val) => !is_null($val));
        $supplier->update($filtered);

        return response()->json($supplier);
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
            $supplier->delete();
            return response()->json([
                'message' => 'Supplier deleted successfully',
                'action' => 'deleted'
            ]);
        }
    }
}
