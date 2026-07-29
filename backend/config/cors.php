<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     | Normalise origin entries: trim whitespace, drop trailing slash, filter blanks.
     | Browsers send the Origin header without a trailing slash, so any value
     | that includes one will silently fail CORS matching.
     */
    'allowed_origins' => array_values(array_filter(array_map(
        fn ($o) => rtrim(trim($o), '/'),
        explode(',', (string) env('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5000'))
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
