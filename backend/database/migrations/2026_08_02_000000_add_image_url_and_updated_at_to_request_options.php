<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Backfill schema fixes for `request_options` discovered during image-CRUD
 * debugging.
 *
 * 1. `image_url` was being set by `AdminRequestActionsController` via mass
 *    assignment (`'image_url' => $imageData[0] ?? null`), but the column
 *    never existed on the table — the INSERT was raising
 *    `SQLSTATE[42S22] Unknown column 'image_url'`. Adding it as a
 *    nullable VARCHAR (500) to mirror `logo_url` / `photo_url`.
 *
 * 2. `updated_at` was missing from the table (only `created_at` was
 *    declared in `create_remaining_tables`). Without `updated_at`,
 *    Eloquent's `->save()` and `->update()` raise a
 *    `Unknown column 'updated_at'` because Laravel tries to write it on
 *    every save. Adding it as a nullable timestamp.
 */
return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('request_options')) {
            return;
        }

        if (!Schema::hasColumn('request_options', 'image_url')) {
            Schema::table('request_options', function (Blueprint $table) {
                $table->string('image_url', 500)->nullable()->after('images');
            });
        }

        if (!Schema::hasColumn('request_options', 'updated_at')) {
            Schema::table('request_options', function (Blueprint $table) {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('request_options')) {
            return;
        }

        if (Schema::hasColumn('request_options', 'image_url')) {
            Schema::table('request_options', function (Blueprint $table) {
                $table->dropColumn('image_url');
            });
        }

        if (Schema::hasColumn('request_options', 'updated_at')) {
            Schema::table('request_options', function (Blueprint $table) {
                $table->dropColumn('updated_at');
            });
        }
    }
};