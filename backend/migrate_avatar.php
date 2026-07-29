<?php
/**
 * Simple script to migrate existing avatar files to database.
 * Run: php migrate_avatar.php
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get user without avatar_data but with avatar_url
$users = DB::table('users')
    ->whereNotNull('avatar_url')
    ->whereNull('avatar_data')
    ->get();

echo "Found " . count($users) . " users with avatars to migrate.\n";

foreach ($users as $user) {
    $path = storage_path('app/public' . $user->avatar_url);
    
    if (file_exists($path)) {
        $avatarData = file_get_contents($path);
        $mimeType = 'image/jpeg';
        
        DB::table('users')
            ->where('id', $user->id)
            ->update([
                'avatar_data' => $avatarData,
                'avatar_mime_type' => $mimeType,
                'avatar_url' => '/api/avatars/' . $user->id,
            ]);
        
        echo "Migrated: User {$user->id} ({$user->avatar_url}) - " . strlen($avatarData) . " bytes\n";
    } else {
        echo "Not found: User {$user->id} ({$path})\n";
    }
}

echo "Done!\n";
