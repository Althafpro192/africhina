<?php

use Illuminate\Support\Facades\Route;

Route::get('/uploads/{path}', function ($path) {
    // File upload path in production: backend/public/uploads/
    $publicUploads = public_path('uploads/' . $path);
    if (file_exists($publicUploads)) {
        $mime = mime_content_type($publicUploads);
        return response()->file($publicUploads)->header('Content-Type', $mime);
    }
    return response()->json(['message' => 'File not found: ' . $path], 404);
})->where('path', '.*');

Route::fallback(function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    return response()->json(['message' => 'Frontend index.html not found. Please build frontend.'], 404);
});

