<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Custom command to run server with increased upload limits
Artisan::command('serve-large', function () {
    $this->info('Starting Laravel development server with large file upload support...');
    $this->info('Upload limit: 50MB | Post limit: 128MB');
    
    passthru('php -d upload_max_filesize=50M -d post_max_size=128M -d memory_limit=256M -d max_execution_time=300 artisan serve');
});
