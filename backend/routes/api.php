<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminRequestActionsController;
use App\Http\Controllers\BuyerRequestActionsController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AdminDriverController;
use App\Http\Controllers\FileUploadController;

$defineRoutes = function() {
    // Public route for avatar images stored in database
    Route::get('/avatars/{userId}', [AuthController::class, 'getAvatar']);
    // Guest authentication / reset routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/register/supplier', [AuthController::class, 'registerSupplier']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/password-reset', [PasswordResetController::class, 'requestPasswordReset']);
    Route::post('/auth/password-reset/confirm', [PasswordResetController::class, 'confirmReset']);

    // Authenticated API routes
    Route::middleware(['auth:sanctum', 'password_changed'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'getMe']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
        Route::post('/auth/avatar', [AuthController::class, 'uploadAvatar']);

        // Sourcing Requests / RFQs
        Route::post('/requests', [RequestController::class, 'createRequest']);
        Route::get('/requests', [RequestController::class, 'getBuyerRequests']);
        Route::get('/requests/{id}', [RequestController::class, 'getRequestDetail']);
        Route::get('/requests/{id}/tracking', [RequestController::class, 'getTrackingLogs']);
        Route::put('/requests/{id}', [RequestController::class, 'editRequest']);
        Route::post('/requests/{id}/cancel', [BuyerRequestActionsController::class, 'cancelRequest']);
        Route::post('/requests/{id}/dispute', [BuyerRequestActionsController::class, 'disputeRequest']);
        Route::post('/requests/{id}/confirm-delivery', [BuyerRequestActionsController::class, 'confirmDelivery']);

        // Options Selection
        Route::post('/requests/{id}/select-option', [BuyerRequestActionsController::class, 'selectOption']);

        // Payments (Buyer)
        Route::post('/payments/requests/{id}', [PaymentController::class, 'uploadPaymentProof']);
        Route::get('/payments/requests/{requestId}', [PaymentController::class, 'getBuyerPayments']);

        // Chat Messages
        Route::get('/requests/{id}/messages', [MessageController::class, 'getMessages']);
        Route::post('/requests/{id}/messages', [MessageController::class, 'sendMessage']);
        Route::put('/requests/{id}/messages/{msgId}', [MessageController::class, 'editMessage']);
        Route::delete('/requests/{id}/messages/{msgId}', [MessageController::class, 'deleteMessage']);

        // Ratings
        Route::post('/ratings', [RatingController::class, 'createRating']);
        Route::get('/ratings/supplier/{supplierId}', [RatingController::class, 'getRatingsBySupplier']);
        Route::get('/ratings/request/{requestId}', [RatingController::class, 'getRatingByRequest']);
        // List all ratings (admin moderation queue)
        Route::get('/ratings', [RatingController::class, 'getAllRatings']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'getNotifications']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

        // Admin-Restricted operations
        Route::middleware(['role'])->group(function () {
            Route::get('/admin/statistics', [AdminController::class, 'getAdminStatistics']);
            Route::get('/admin/requests', [AdminController::class, 'getAdminRequests']);
            Route::get('/admin/requests/{id}', [AdminController::class, 'getAdminRequestById']);
            Route::put('/admin/requests/{id}', [AdminController::class, 'updateAdminRequest']);
            
            Route::post('/admin/requests/{id}/options', [AdminRequestActionsController::class, 'uploadRequestOptions']);
            Route::put('/admin/requests/{id}/options/{optionId}', [AdminRequestActionsController::class, 'updateRequestOption']);
            Route::delete('/admin/requests/{id}/options/{optionId}', [AdminRequestActionsController::class, 'deleteRequestOption']);
            
            Route::post('/admin/requests/{id}/finalize', [AdminRequestActionsController::class, 'finalizeDeal']);
            Route::post('/admin/requests/{id}/proceed-to-negotiate', [AdminRequestActionsController::class, 'proceedToNegotiate']);
            Route::post('/admin/requests/{id}/ship', [AdminRequestActionsController::class, 'shipOrder']);
            Route::post('/admin/requests/{id}/complete', [AdminRequestActionsController::class, 'completeOrder']);
            Route::post('/admin/requests/{id}/media', [AdminController::class, 'uploadQCMedia']);
            Route::post('/admin/requests/{id}/email', [AdminController::class, 'sendEmailToSupplier']);
            
            Route::post('/admin/users/{userId}/toggle-block', [AdminController::class, 'toggleBlockUser']);
            Route::get('/admin/users/{userId}', [AdminController::class, 'getBuyerProfile']);
            Route::get('/admin/users', [AdminController::class, 'getBuyerList']);
            Route::post('/admin/users/{userId}/temp-password', [AdminController::class, 'generateTempPassword']);

            Route::get('/admin/suppliers', [SupplierController::class, 'getSuppliers']);
            Route::post('/admin/suppliers', [SupplierController::class, 'createSupplier']);
            Route::put('/admin/suppliers/{id}', [SupplierController::class, 'updateSupplier']);
            Route::delete('/admin/suppliers/{id}', [SupplierController::class, 'deleteSupplier']);
            Route::post('/admin/suppliers/{id}/toggle-block', [SupplierController::class, 'toggleBlockSupplier']);
            Route::post('/admin/suppliers/{id}/logo', [SupplierController::class, 'uploadLogo']);
            Route::delete('/admin/suppliers/{id}/logo', [SupplierController::class, 'deleteLogo']);

            // Drivers (delivery personnel) management
            Route::get('/admin/drivers/available', [AdminDriverController::class, 'listAvailable']);
            Route::get('/admin/drivers', [AdminDriverController::class, 'index']);
            Route::post('/admin/drivers', [AdminDriverController::class, 'store']);
            Route::get('/admin/drivers/{id}', [AdminDriverController::class, 'show']);
            Route::put('/admin/drivers/{id}', [AdminDriverController::class, 'update']);
            Route::delete('/admin/drivers/{id}', [AdminDriverController::class, 'destroy']);
            Route::post('/admin/drivers/{id}/toggle-block', [AdminDriverController::class, 'toggleBlock']);
            Route::post('/admin/drivers/{id}/temp-password', [AdminDriverController::class, 'generateTempPassword']);
            Route::post('/admin/drivers/{id}/photo', [AdminDriverController::class, 'uploadPhoto']);
            Route::delete('/admin/drivers/{id}/photo', [AdminDriverController::class, 'deletePhoto']);

            // Assign a driver (or trusted provider) to a request
            Route::post('/admin/requests/{id}/assign-driver', [AdminRequestActionsController::class, 'assignDriver']);

            Route::post('/admin/ratings/{id}/toggle-publish', [AdminRequestActionsController::class, 'togglePublishRating']);
            Route::get('/admin/ratings', [RatingController::class, 'getAllRatings']);
            Route::get('/admin/security/password-resets', [PasswordResetController::class, 'getResetRequests']);
            Route::post('/admin/security/password-resets/{requestId}/process', [PasswordResetController::class, 'processResetRequest']);

            // Payments (Admin verification & rejection)
            Route::put('/payments/admin/{id}/verify', [PaymentController::class, 'verifyPayment']);
            Route::put('/payments/admin/{id}/reject', [PaymentController::class, 'rejectPayment']);
            Route::post('/payments/admin/requests/{requestId}/release', [PaymentController::class, 'release']);
            Route::post('/payments/admin/requests/{requestId}/refund', [PaymentController::class, 'refund']);
            Route::get('/payments/admin/requests/{requestId}', [PaymentController::class, 'getAdminPayments']);
            
            Route::post('/admin/security/password-resets/{requestId}/reject', [PasswordResetController::class, 'rejectResetRequest']);
        });

        // File Upload endpoints (accessible to authenticated users)
        Route::post('/upload', [FileUploadController::class, 'upload']);
        Route::post('/upload/multiple', [FileUploadController::class, 'uploadMultiple']);
        Route::delete('/upload', [FileUploadController::class, 'delete']);
        Route::get('/upload/{filename}', [FileUploadController::class, 'info']);
    });
};

/*
 | Routes are registered only ONCE at /api. The duplicate /api/v1 prefix
 | was removed to eliminate route duplication and route-list bloat. The
 | EnsurePasswordChanged middleware uses path-suffix matching so the
 | must-change-password guard still works.
 */
Route::group([], $defineRoutes);
