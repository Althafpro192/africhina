<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SocketService
{
    /**
     * Broadcasts an event with a payload to the Socket.io bridge server.
     */
    public static function broadcast($event, $payload)
    {
        // Removed Http call to non-existent localhost:5001 socket server
        // This avoids a 2-second cURL timeout delay on every message sent.
        // Real-time updates are now handled by frontend polling.
        // Log::info("Broadcast event '{$event}' triggered.");
    }
}
