<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add image columns to suppliers and drivers tables.
 *
 * - suppliers.logo_url : VARCHAR (path/url to uploaded logo)
 * - drivers.photo_url  : VARCHAR (path/url to uploaded photo)
 */
return new class extends Migration {
    public function up(): void
    {
        // Suppliers - company logo
        if (Schema::hasTable('suppliers')) {
            if (!Schema::hasColumn('suppliers', 'logo_url')) {
                Schema::table('suppliers', function (Blueprint $table) {
                    $table->string('logo_url', 500)->nullable()->after('factory_address');
                });
            }
        }

        // Drivers - user profile photo (drivers are stored in users table with role='driver')
        if (Schema::hasTable('users')) {
            if (!Schema::hasColumn('users', 'photo_url')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->string('photo_url', 500)->nullable()->after('avatar_mime_type');
                });
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('suppliers') && Schema::hasColumn('suppliers', 'logo_url')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->dropColumn('logo_url');
            });
        }

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'photo_url')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('photo_url');
            });
        }
    }
};