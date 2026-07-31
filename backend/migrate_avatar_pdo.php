<?php
/**
 * Direct PDO script to migrate avatars - avoids Laravel query log issues.
 * Run: php migrate_avatar_pdo.php
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get database credentials from config
$config = config('database.connections.mysql');

// Connect via PDO directly
$dsn = sprintf('mysql:host=%s;port=%s;dbname=%s',
    $config['host'],
    $config['port'] ?? 3306,
    $config['database']
);

$pdo = new PDO($dsn, $config['username'], $config['password']);

// Find users with avatar_url but no avatar_data (without selecting the BLOB)
$stmt = $pdo->prepare("SELECT id, avatar_url FROM users WHERE avatar_url IS NOT NULL AND (avatar_data IS NULL OR avatar_data = '') LIMIT 1");
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo "No users with avatars to migrate.\n";
    exit(0);
}

echo "Found user to migrate: " . $user['id'] . "\n";
echo "Avatar URL: " . $user['avatar_url'] . "\n";

// Get the file path
$filePath = storage_path('app/public' . $user['avatar_url']);
echo "File path: " . $filePath . "\n";

if (!file_exists($filePath)) {
    echo "File not found!\n";
    exit(1);
}

// Read the file
$avatarData = file_get_contents($filePath);
$avatarSize = strlen($avatarData);
echo "Read " . $avatarSize . " bytes from file.\n";

// Update the database directly with LOAD_FILE or direct binary data
// Use prepared statement with binary parameter
$updateStmt = $pdo->prepare("UPDATE users SET avatar_data = :data, avatar_mime_type = :mime, avatar_url = :newUrl WHERE id = :id");
$updateStmt->bindValue(':data', $avatarData, PDO::PARAM_LOB);
$updateStmt->bindValue(':mime', 'image/jpeg', PDO::PARAM_STR);
$updateStmt->bindValue(':newUrl', '/api/avatars/' . $user['id'], PDO::PARAM_STR);
$updateStmt->bindValue(':id', $user['id'], PDO::PARAM_STR);

if ($updateStmt->execute()) {
    echo "SUCCESS! Avatar migrated to database.\n";
    
    // Verify
    $verifyStmt = $pdo->prepare("SELECT LENGTH(avatar_data) as size, avatar_mime_type FROM users WHERE id = ?");
    $verifyStmt->execute([$user['id']]);
    $result = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    echo "Verified - Stored " . $result['size'] . " bytes, MIME: " . $result['avatar_mime_type'] . "\n";
} else {
    echo "FAILED to update!\n";
    print_r($updateStmt->errorInfo());
}

echo "Done!\n";
