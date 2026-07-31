<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateAvatarsToDatabase extends Command
{
    protected $signature = 'avatars:migrate-to-db {--dry-run : Show what would be migrated without making changes}';
    protected $description = 'Migrate existing avatar files from filesystem to MySQL database';

    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        $users = User::whereNotNull('avatar_url')
            ->whereNull('avatar_data')
            ->get();
        
        $this->info("Found {$users->count()} users with existing avatars.");
        
        if ($users->isEmpty()) {
            $this->info('No users with avatars to migrate.');
            return 0;
        }
        
        $migrated = 0;
        $skipped = 0;
        $errors = 0;
        
        foreach ($users as $user) {
            $avatarUrl = $user->avatar_url;
            
            // Skip if already pointing to our API endpoint
            if (str_starts_with($avatarUrl, '/api/avatars/')) {
                $this->line("User {$user->id}: Already using database storage, skipping.");
                $skipped++;
                continue;
            }
            
            // Try to read from filesystem
            $path = null;
            if (str_starts_with($avatarUrl, '/uploads/')) {
                $path = storage_path('app/public' . $avatarUrl);
            } elseif (str_starts_with($avatarUrl, '/storage/')) {
                $path = public_path($avatarUrl);
            }
            
            if ($path && file_exists($path)) {
                $avatarData = file_get_contents($path);
                $mimeType = $this->getMimeType($path);
                
                if ($dryRun) {
                    $this->line("User {$user->id}: Would migrate {$avatarUrl} ({$this->formatBytes(strlen($avatarData))})");
                } else {
                    $user->update([
                        'avatar_data' => $avatarData,
                        'avatar_mime_type' => $mimeType,
                        'avatar_url' => '/api/avatars/' . $user->id,
                    ]);
                    $this->info("User {$user->id}: Migrated successfully.");
                }
                $migrated++;
            } else {
                $this->warn("User {$user->id}: File not found at {$path}");
                $errors++;
            }
        }
        
        $this->newLine();
        $this->info("Migration complete:");
        $this->info("  - Migrated: {$migrated}");
        $this->info("  - Skipped: {$skipped}");
        $this->info("  - Errors: {$errors}");
        
        return 0;
    }
    
    private function getMimeType($path)
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        return match($extension) {
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'bmp' => 'image/bmp',
            default => 'image/jpeg',
        };
    }
    
    private function formatBytes($bytes)
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }
}
