<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if ($user && $user->currentAccessToken()) {
            $abilities = $user->currentAccessToken()->abilities ?? [];
            if (in_array('must-change-password', $abilities) && !in_array('*', $abilities)) {
                $allowedPaths = [
                    'api/v1/auth/change-password',
                    'api/v1/auth/me',
                    'api/v1/auth/logout',
                    'api/v1/auth/set-new-password',
                    'change-password',
                    'set-new-password',
                    'logout',
                    'me'
                ];
                
                $path = $request->path();
                $allowed = false;
                
                foreach ($allowedPaths as $allowedPath) {
                    if (str_ends_with($path, $allowedPath) || $request->is($allowedPath)) {
                        $allowed = true;
                        break;
                    }
                }
                
                if (!$allowed) {
                    return response()->json([
                        'mustChangePassword' => true,
                        'message' => 'You must update your temporary password before accessing application resources.'
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
