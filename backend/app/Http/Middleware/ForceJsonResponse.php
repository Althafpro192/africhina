<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ForceJsonResponse
{
    /**
     * Handle an incoming request and force all responses to JSON.
     *
     * - Forces the client to negotiate JSON via the Accept header.
     * - Catches common framework exceptions that would otherwise render
     *   HTML error pages, and converts them to JSON.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        try {
            return $next($request);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
                'code' => 'VALIDATION_ERROR',
            ], $e->status);
        } catch (AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Unauthenticated.',
                'code' => 'UNAUTHENTICATED',
            ], 401);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found.',
                'code' => 'NOT_FOUND',
            ], 404);
        } catch (NotFoundHttpException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Endpoint not found.',
                'code' => 'NOT_FOUND',
            ], 404);
        } catch (HttpExceptionInterface $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'HTTP error.',
                'code' => 'HTTP_ERROR',
            ], $e->getStatusCode());
        }
    }
}