<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add avatar_data column to store image as BLOB
            // LONGBLOB can store up to 4GB, but we limit to ~5MB via validation
            $table->longText('avatar_data')->nullable()->after('avatar_url');
            
            // Add avatar_mime_type to store the MIME type for proper content-type header
            $table->string('avatar_mime_type', 50)->nullable()->after('avatar_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_data', 'avatar_mime_type']);
        });
    }
};
