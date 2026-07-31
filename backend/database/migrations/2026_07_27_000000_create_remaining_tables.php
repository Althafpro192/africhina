<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 2. Table: suppliers
        if (!Schema::hasTable('suppliers')) {
            Schema::create('suppliers', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('company_name', 200);
                $table->string('category', 50)->nullable();
                $table->string('contact_person', 100)->nullable();
                $table->string('phone_china', 20)->nullable();
                $table->string('email', 100)->nullable();
                $table->text('factory_address')->nullable();
                $table->text('certificates')->nullable();
                $table->string('verification_level', 20)->default('Dokumen');
                $table->decimal('avg_rating', 3, 2)->default(0);
                $table->text('notes')->nullable();
                $table->boolean('is_blocked')->default(false);
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 3. Table: requests
        if (!Schema::hasTable('requests')) {
            Schema::create('requests', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id')->nullable();
                $table->string('product_name', 200);
                $table->string('category', 50);
                $table->text('specifications')->nullable();
                $table->integer('quantity')->nullable();
                $table->string('budget_range', 50)->nullable();
                $table->string('sub_category', 100)->nullable();
                $table->string('unit', 50)->nullable();
                $table->string('currency', 20)->nullable();
                $table->date('delivery_timeline')->nullable();
                $table->string('shipping_terms', 50)->nullable();
                $table->string('payment_terms', 50)->nullable();
                $table->text('quality_requirements')->nullable();
                $table->text('certifications')->nullable();
                $table->json('image_urls')->nullable(); // stored as json
                $table->string('status', 50)->default('pending');
                $table->uuid('assigned_supplier_id')->nullable();
                $table->decimal('quoted_price', 15, 2)->nullable();
                $table->timestamp('quote_accepted_at')->nullable();
                $table->integer('production_progress')->default(0);
                $table->json('production_media')->nullable(); // stored as json
                $table->date('estimated_arrival_date')->nullable();
                $table->text('internal_notes')->nullable();
                $table->timestamp('deal_finalized_at')->nullable();
                $table->text('payment_proof_url')->nullable();
                $table->text('buyer_notes')->nullable();
                $table->decimal('final_price', 15, 2)->nullable();
                $table->json('price_breakdown')->nullable();
                $table->string('bank_name', 100)->nullable();
                $table->string('bank_account_number', 100)->nullable();
                $table->string('bank_account_name', 100)->nullable();
                $table->text('payment_qr_url')->nullable();
                $table->text('payment_notes')->nullable();
                $table->text('payment_rejection_reason')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('assigned_supplier_id')->references('id')->on('suppliers')->onDelete('set null');
            });
        }

        // 4. Table: request_options
        if (!Schema::hasTable('request_options')) {
            Schema::create('request_options', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('request_id');
                $table->string('product_name', 200)->nullable();
                $table->text('description')->nullable();
                $table->decimal('price_min', 15, 2)->nullable();
                $table->decimal('price_max', 15, 2)->nullable();
                $table->text('admin_reason')->nullable();
                $table->date('target_delivery')->nullable();
                $table->string('shipping_method', 50)->nullable();
                $table->string('est_time_sea', 100)->nullable();
                $table->string('est_time_air', 100)->nullable();
                $table->boolean('is_fixed_price')->default(false);
                $table->boolean('is_selected')->default(false);
                $table->json('images')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            });
        }

        // 5. Table: tracking_logs
        if (!Schema::hasTable('tracking_logs')) {
            Schema::create('tracking_logs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('request_id');
                $table->string('status', 50)->nullable();
                $table->text('notes')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            });
        }

        // 6. Table: ratings
        if (!Schema::hasTable('ratings')) {
            Schema::create('ratings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('request_id');
                $table->uuid('supplier_id')->nullable();
                $table->uuid('buyer_id')->nullable();
                $table->integer('score');
                $table->text('review')->nullable();
                $table->boolean('is_published')->default(true);
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
                $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
                $table->foreign('buyer_id')->references('id')->on('users')->onDelete('set null');
            });
        }

        // 7. Table: email_logs
        if (!Schema::hasTable('email_logs')) {
            Schema::create('email_logs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('request_id');
                $table->uuid('sender_id')->nullable();
                $table->string('receiver_email', 100)->nullable();
                $table->text('subject')->nullable();
                $table->text('body')->nullable();
                $table->timestamp('sent_at')->useCurrent();

                $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
                $table->foreign('sender_id')->references('id')->on('users')->onDelete('set null');
            });
        }

        // 8. Table: notifications
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id');
                $table->string('title', 200);
                $table->text('message');
                $table->string('icon', 50)->default('notifications');
                $table->string('path', 200)->nullable();
                $table->boolean('read')->default(false);
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // 9. Table: payments
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('request_id');
                $table->decimal('amount', 15, 2)->nullable();
                $table->string('currency', 20)->nullable();
                $table->decimal('exchange_rate', 15, 6)->nullable();
                $table->text('payment_proof_url')->nullable();
                $table->string('status', 50)->default('pending');
                $table->uuid('verified_by')->nullable();
                $table->timestamp('verified_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent();

                $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
                $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            });
        }

        // 10. Table: messages
        if (!Schema::hasTable('messages')) {
            Schema::create('messages', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('request_id')->nullable();
                $table->uuid('buyer_id')->nullable();
                $table->uuid('sender_id')->nullable();
                $table->text('content');
                $table->json('translations')->nullable();
                $table->longText('media_url')->nullable();
                $table->string('media_type', 50)->nullable();
                $table->boolean('is_edited')->default(false);
                $table->boolean('is_deleted')->default(false);
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
                $table->foreign('buyer_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('sender_id')->references('id')->on('users')->onDelete('set null');
            });
        }

        // 11. Table: password_reset_requests
        if (!Schema::hasTable('password_reset_requests')) {
            Schema::create('password_reset_requests', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id');
                $table->string('email', 100);
                $table->string('status', 20)->default('pending');
                $table->string('token', 100)->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset_requests');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('email_logs');
        Schema::dropIfExists('ratings');
        Schema::dropIfExists('tracking_logs');
        Schema::dropIfExists('request_options');
        Schema::dropIfExists('requests');
        Schema::dropIfExists('suppliers');
    }
};
