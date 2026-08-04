<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Increase the legacy single-image column so it can store a data URI.
     *
     * Request option images are currently persisted as base64 data URIs in
     * both `images` and the backward-compatible `image_url` column. A
     * VARCHAR(500) column is too small even for modest image files.
     */
    public function up(): void
    {
        if (Schema::hasColumn('request_options', 'image_url')) {
            DB::statement(
                'ALTER TABLE request_options MODIFY COLUMN image_url LONGTEXT NULL'
            );
        }
    }

    /**
     * Restore the original column type.
     *
     * This rollback is only safe when every stored value is at most 500
     * characters; larger data URIs must be removed or migrated first.
     */
    public function down(): void
    {
        if (Schema::hasColumn('request_options', 'image_url')) {
            DB::statement(
                'ALTER TABLE request_options MODIFY COLUMN image_url VARCHAR(500) NULL'
            );
        }
    }
};
