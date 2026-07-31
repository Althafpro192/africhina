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
use Illuminate\Support\Facades\Log;

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
            $rfq = RFQRequest::find($idParam);
            if ($rfq) {
                $requestId = $idParam;
                $buyerId = $rfq->user_id;
            } else {
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
        try {
            $user = $request->user();

            // Only block buyers, not admins
            if ($user->is_blocked && $user->role !== 'admin') {
                return response()->json(['message' => 'You are blocked from sending messages.'], 403);
            }

            [$requestId, $buyerId] = $this->resolveThread($id, $user);

            if (!$buyerId && !$requestId) {
                return response()->json(['message' => 'Invalid chat target recipient'], 400);
            }

            // Increased file size limit to 50MB for images and videos
            // Note: PHP post_max_size and upload_max_filesize must be >= 50M in php.ini
            $validated = $request->validate([
                'content' => 'nullable|string',
                'file' => 'nullable|file|max:51200', // 50MB in KB
                'media' => 'nullable|file|max:51200', // 50MB in KB
            ]);

            if (empty($validated['content']) && !$request->hasFile('file') && !$request->hasFile('media')) {
                return response()->json(['message' => 'Message content or media is required'], 400);
            }

            $mediaData = null;
            $mediaType = null;

            $uploadedFile = null;
            if ($request->hasFile('media')) {
                $uploadedFile = $request->file('media');
            } elseif ($request->hasFile('file')) {
                $uploadedFile = $request->file('file');
            }

            if ($uploadedFile) {
                $mimeType = $uploadedFile->getMimeType();
                
                // Read file content and encode as base64 data URI
                $fileContent = file_get_contents($uploadedFile->getRealPath());
                if ($fileContent === false) {
                    return response()->json(['message' => 'Failed to read uploaded file'], 500);
                }
                
                $mediaData = 'data:' . $mimeType . ';base64,' . base64_encode($fileContent);

                $mime = $uploadedFile->getClientMimeType();
                if (str_starts_with($mime, 'image/')) {
                    $mediaType = 'image';
                } elseif (str_starts_with($mime, 'video/')) {
                    $mediaType = 'video';
                } elseif (str_starts_with($mime, 'audio/')) {
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
                'media_url' => $mediaData,
                'media_type' => $mediaType,
            ]);

            $messagePayload = Message::select('messages.*', 'users.full_name as sender_name', 'users.role as sender_role')
                ->join('users', 'messages.sender_id', '=', 'users.id')
                ->where('messages.id', $message->id)
                ->first();

            SocketService::broadcast('new-message', $messagePayload);

            $channelId = $requestId ?? ('buyer-' . $buyerId);
            broadcast(new \App\Events\MessageSent($message, $channelId))->toOthers();

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
        } catch (\Exception $e) {
            Log::error('Send message error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send message: ' . $e->getMessage(),
            ], 500);
        }
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
            'media_data' => null,
            'media_type' => null,
        ]);

        $payload = ['id' => $msgId, 'is_deleted' => true];
        SocketService::broadcast('message-deleted', $payload);

        return response()->json(['message' => 'Message deleted successfully', 'id' => $msgId]);
    }
}
