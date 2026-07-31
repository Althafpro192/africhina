<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Convert image_urls in requests table to LONGBLOB (JSON of base64)
        Schema::table('requests', function (Blueprint $table) {
            // Add new LONGBLOB columns
            $table->longText('image_data')->nullable()->after('image_urls');
        });
        
        // Convert images in request_options table to LONGBLOB
        Schema::table('request_options', function (Blueprint $table) {
            $table->longText('images_data')->nullable()->after('images');
        });
        
        // Convert media_url in messages table to LONGBLOB
        Schema::table('messages', function (Blueprint $table) {
            $table->longText('media_data')->nullable()->after('media_url');
        });
        
        // Convert payment proof and QR in requests table
        Schema::table('requests', function (Blueprint $table) {
            $table->longText('payment_proof_data')->nullable()->after('payment_proof_url');
            $table->longText('payment_qr_data')->nullable()->after('payment_qr_url');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['image_data', 'payment_proof_data', 'payment_qr_data']);
        });
        
        Schema::table('request_options', function (Blueprint $table) {
            $table->dropColumn('images_data');
        });
        
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('media_data');
        });
    }
};
