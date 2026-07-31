<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    /**
     * Allowed MIME types for each category
     */
    private array $allowedTypes = [
        'images' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/svg+xml',
            'image/webp',
            'image/avif',
        ],
        'videos' => [
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/x-msvideo',
        ],
        'documents' => [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
    ];

    /**
     * Maximum file size in bytes (20MB)
     */
    private int $maxFileSize = 20971520;

    /**
     * Upload a single file
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'file' => 'required|file|max:20480', // 20MB in KB
        ]);

        $file = $request->file('file');

        // Validate file type
        $mimeType = $file->getMimeType();
        $isAllowed = false;
        $category = 'other';

        foreach ($this->allowedTypes as $cat => $types) {
            if (in_array($mimeType, $types)) {
                $isAllowed = true;
                $category = $cat;
                break;
            }
        }

        if (!$isAllowed) {
            return response()->json([
                'message' => 'File type not allowed. Allowed types: jpg, png, gif, svg, webp, avif, mp4, webm, mov, avi, pdf, doc, docx, xls, xlsx',
            ], 422);
        }

        // Validate file size
        if ($file->getSize() > $this->maxFileSize) {
            return response()->json([
                'message' => 'File size exceeds maximum limit of 20MB.',
            ], 422);
        }

        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;

        // Store file
        $path = $file->storeAs('uploads', $filename, 'public');

        // Get file URL
        $url = '/uploads/' . $filename;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => Str::uuid()->toString(),
                'name' => $file->getClientOriginalName(),
                'filename' => $filename,
                'url' => $url,
                'type' => $category,
                'mimeType' => $mimeType,
                'size' => $file->getSize(),
                'extension' => $extension,
            ],
        ]);
    }

    /**
     * Upload multiple files
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadMultiple(Request $request)
    {
        $validated = $request->validate([
            'files' => 'required|array|max:10',
            'files.*' => 'required|file|max:20480',
        ]);

        $results = [];
        $errors = [];

        foreach ($request->file('files') as $index => $file) {
            // Validate file type
            $mimeType = $file->getMimeType();
            $isAllowed = false;
            $category = 'other';

            foreach ($this->allowedTypes as $cat => $types) {
                if (in_array($mimeType, $types)) {
                    $isAllowed = true;
                    $category = $cat;
                    break;
                }
            }

            if (!$isAllowed) {
                $errors[] = [
                    'index' => $index,
                    'name' => $file->getClientOriginalName(),
                    'message' => 'File type not allowed',
                ];
                continue;
            }

            // Validate file size
            if ($file->getSize() > $this->maxFileSize) {
                $errors[] = [
                    'index' => $index,
                    'name' => $file->getClientOriginalName(),
                    'message' => 'File size exceeds maximum limit of 20MB',
                ];
                continue;
            }

            // Generate unique filename
            $extension = $file->getClientOriginalExtension();
            $filename = Str::uuid() . '.' . $extension;

            // Store file
            $path = $file->storeAs('uploads', $filename, 'public');

            // Get file URL
            $url = '/uploads/' . $filename;

            $results[] = [
                'id' => Str::uuid()->toString(),
                'name' => $file->getClientOriginalName(),
                'filename' => $filename,
                'url' => $url,
                'type' => $category,
                'mimeType' => $mimeType,
                'size' => $file->getSize(),
                'extension' => $extension,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'uploaded' => $results,
                'errors' => $errors,
            ],
        ]);
    }

    /**
     * Delete a file
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|string',
        ]);

        $url = $validated['url'];

        // Extract path from URL
        $path = str_replace('/uploads/', '', $url);
        $fullPath = 'public/uploads/' . $path;

        if (Storage::exists($fullPath)) {
            Storage::delete($fullPath);
            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'File not found',
        ], 404);
    }

    /**
     * Get file info
     * 
     * @param string $filename
     * @return \Illuminate\Http\JsonResponse
     */
    public function info(string $filename)
    {
        $path = 'public/uploads/' . $filename;

        if (!Storage::exists($path)) {
            return response()->json([
                'message' => 'File not found',
            ], 404);
        }

        $fullPath = Storage::path($path);
        $mimeType = Storage::mimeType($path);
        $size = Storage::size($path);

        // Determine category
        $category = 'other';
        foreach ($this->allowedTypes as $cat => $types) {
            if (in_array($mimeType, $types)) {
                $category = $cat;
                break;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'filename' => $filename,
                'url' => '/uploads/' . $filename,
                'type' => $category,
                'mimeType' => $mimeType,
                'size' => $size,
            ],
        ]);
    }
}
