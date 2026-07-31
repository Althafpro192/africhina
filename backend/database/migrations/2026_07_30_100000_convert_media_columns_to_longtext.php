<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration converts media storage columns from TEXT to LONGTEXT
     * to support base64-encoded images and videos up to ~50MB.
     * 
     * TEXT: ~65KB limit (too small for base64-encoded images)
     * LONGTEXT: ~4GB limit (supports large images and videos)
     * 
     * Note: Base64 encoding increases size by ~33%, so a 5MB image
     * becomes ~6.5MB when base64-encoded.
     */
    public function up(): void
    {
        // Fix messages table - media_url column
        if (Schema::hasColumn('messages', 'media_url')) {
            DB::statement('ALTER TABLE messages MODIFY COLUMN media_url LONGTEXT NULL');
        }

        // Ensure users table avatar columns are properly sized
        if (Schema::hasColumn('users', 'avatar_data')) {
            DB::statement('ALTER TABLE users MODIFY COLUMN avatar_data LONGTEXT NULL');
        }

        // Also fix any other text columns that might store base64 data
        // Check if image_urls in requests needs fixing (it's JSON so should be OK)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to TEXT (not recommended but provided for rollback)
        if (Schema::hasColumn('messages', 'media_url')) {
            DB::statement('ALTER TABLE messages MODIFY COLUMN media_url TEXT NULL');
        }

        if (Schema::hasColumn('users', 'avatar_data')) {
            DB::statement('ALTER TABLE users MODIFY COLUMN avatar_data MEDIUMTEXT NULL');
        }
    }
};
