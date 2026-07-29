<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Request as RFQRequest;
use App\Models\User;
use App\Models\Notification;
use App\Services\TranslatorService;
use App\Services\SocketService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    private function resolveThread($idParam, $user)
    {
        $requestId = null;
        $buyerId = request()->query('buyer_id');

        if (empty($idParam) || $idParam === 'general-support') {
            if ($user->role === 'buyer') {
                $buyerId = $user->id;
            }
        } elseif (str_starts_with($idParam, 'buyer-')) {
            $buyerId = str_replace('buyer-', '', $idParam);
        } elseif (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $idParam)) {
            // Check if it's an RFQ ID
            $rfq = RFQRequest::find($idParam);
            if ($rfq) {
                $requestId = $idParam;
                $buyerId = $rfq->user_id;
            } else {
                // Check if it's a Buyer User ID
                $buyer = User::find($idParam);
                if ($buyer) {
                    $buyerId = $idParam;
                }
            }
        }

        if (empty($buyerId) && $user->role === 'buyer') {
            $buyerId = $user->id;
        }

        return [$requestId, $buyerId];
    }

    public function getMessages(Request $request, $id)
    {
        [$requestId, $buyerId] = $this->resolveThread($id, $request->user());

        $query = Message::select('messages.*', 'users.full_name as sender_name', 'users.role as sender_role')
            ->join('users', 'messages.sender_id', '=', 'users.id');

        if ($requestId) {
            $query->where('messages.request_id', $requestId);
        } elseif ($buyerId) {
            $query->whereNull('messages.request_id')->where('messages.buyer_id', $buyerId);
        } else {
            return response()->json([]);
        }

        $messages = $query->orderBy('messages.created_at', 'asc')->get();
        return response()->json($messages);
    }

    public function sendMessage(Request $request, $id)
    {
        $user = $request->user();

        if ($user->is_blocked) {
            return response()->json(['message' => 'You are blocked from sending messages.'], 403);
        }

        [$requestId, $buyerId] = $this->resolveThread($id, $user);

        if (!$buyerId && !$requestId) {
            return response()->json(['message' => 'Invalid chat target recipient'], 400);
        }

        $validated = $request->validate([
            'content' => 'nullable|string',
            'file' => 'nullable|file|max:20480', // 20MB QC media limits
        ]);

        if (empty($validated['content']) && !$request->hasFile('file')) {
            return response()->json(['message' => 'Message content or media is required'], 400);
        }

        $mediaUrl = null;
        $mediaType = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('uploads', 'public');
            $mediaUrl = '/uploads/' . $path;

            $mime = $file->getClientMimeType();
            if (str_starts_with($mime, 'image/')) {
                $mediaType = 'image';
            } elseif (str_starts_with($mime, 'audio/') || str_starts_with($mime, 'video/')) {
                $mediaType = 'audio';
            } else {
                $mediaType = 'document';
            }
        }

        $content = $validated['content'] ?? '';
        $translations = TranslatorService::getTranslations($content);

        $message = Message::create([
            'request_id' => $requestId,
            'buyer_id' => $buyerId,
            'sender_id' => $user->id,
            'content' => $content,
            'translations' => $translations,
            'media_url' => $mediaUrl,
            'media_type' => $mediaType,
        ]);

        $messagePayload = Message::select('messages.*', 'users.full_name as sender_name', 'users.role as sender_role')
            ->join('users', 'messages.sender_id', '=', 'users.id')
            ->where('messages.id', $message->id)
            ->first();

        // Broadcast to Socket bridge (Legacy)
        SocketService::broadcast('new-message', $messagePayload);

        // Broadcast to Laravel Reverb (New)
        $channelId = $requestId ?? ('buyer-' . $buyerId);
        broadcast(new \App\Events\MessageSent($message, $channelId))->toOthers();

        // Create persistent notification in DB
        try {
            $displayContent = $content ?: 'Sent an attachment';
            if ($user->role === 'admin') {
                if ($buyerId) {
                    Notification::create([
                        'user_id' => $buyerId,
                        'title' => 'New message from Support',
                        'message' => $displayContent,
                        'icon' => 'forum',
                        'path' => '/buyer/messages',
                    ]);
                    
                    // Broadcast notification real-time to buyer
                    SocketService::broadcast('new-notification', [
                        'user_id' => $buyerId,
                        'title' => 'New message from Support',
                        'message' => $displayContent,
                        'icon' => 'forum',
                        'path' => '/buyer/messages',
                    ]);
                }
            } else {
                $admins = User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    Notification::create([
                        'user_id' => $admin->id,
                        'title' => "New Message from {$messagePayload->sender_name}",
                        'message' => $displayContent,
                        'icon' => 'forum',
                        'path' => '/admin/messages',
                    ]);
                }
                
                // Broadcast notification real-time to admins
                SocketService::broadcast('new-notification', [
                    'title' => "New Message from {$messagePayload->sender_name}",
                    'message' => $displayContent,
                    'icon' => 'forum',
                    'path' => '/admin/messages',
                ]);
            }
        } catch (\Exception $err) {
            Log::warning("Failed to create database notification: " . $err->getMessage());
        }

        return response()->json($messagePayload, 201);
    }

    public function editMessage(Request $request, $id, $msgId)
    {
        $message = Message::find($msgId);
        if (!$message) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized to edit this message'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $content = $validated['content'];
        $translations = TranslatorService::getTranslations($content);

        $message->update([
            'content' => $content,
            'translations' => $translations,
            'is_edited' => true,
        ]);

        $messagePayload = Message::select('messages.*', 'users.full_name as sender_name', 'users.role as sender_role')
            ->join('users', 'messages.sender_id', '=', 'users.id')
            ->where('messages.id', $msgId)
            ->first();

        // Broadcast edit to Socket bridge
        SocketService::broadcast('message-edited', $messagePayload);

        return response()->json($messagePayload);
    }

    public function deleteMessage(Request $request, $id, $msgId)
    {
        $message = Message::find($msgId);
        if (!$message) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        if ($message->sender_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to delete this message'], 403);
        }

        $message->update([
            'is_deleted' => true,
            'content' => '',
            'translations' => [],
            'media_url' => null,
            'media_type' => null,
        ]);

        $payload = ['id' => $msgId, 'is_deleted' => true];

        // Broadcast delete to Socket bridge
        SocketService::broadcast('message-deleted', $payload);

        return response()->json(['message' => 'Message deleted successfully', 'id' => $msgId]);
    }
}
