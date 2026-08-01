<?php
/**
 * Simple PHP Upload Test for AfriChina
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Get auth token first
$loginResponse = testLogin();
if (!$loginResponse) {
    echo "Cannot proceed without login token\n";
    exit(1);
}

$token = $loginResponse['token'];

echo "\n============================================================\n";
echo "  AfriChina Upload Feature Test Suite (PHP)\n";
echo "============================================================\n\n";

// Test 1: Generic File Upload
echo "TEST 1: Generic File Upload\n";
$result = testFileUpload($token);
echo $result ? "✅ PASSED\n" : "❌ FAILED\n";

// Test 2: Avatar Upload  
echo "\nTEST 2: Avatar Upload\n";
$result = testAvatarUpload($token);
echo $result ? "✅ PASSED\n" : "❌ FAILED\n";

// Test 3: Get Profile (Avatar Display)
echo "\nTEST 3: Get User Profile\n";
$result = testGetProfile($token);
echo $result ? "✅ PASSED\n" : "❌ FAILED\n";

echo "\n============================================================\n";
echo "Run browser-based E2E tests for complete verification.\n";

/**
 * Test login and return token
 */
function testLogin() {
    $ch = curl_init('http://127.0.0.1:8000/api/auth/login');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'email' => 'admin@africhina.com',
            'password' => 'admin123'
        ]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (isset($data['token'])) {
            echo "✅ Login successful - User ID: " . ($data['user']['id'] ?? 'N/A') . "\n";
            return $data;
        }
    }
    
    echo "❌ Login failed - HTTP $httpCode\n";
    return null;
}

/**
 * Test file upload
 */
function testFileUpload($token) {
    $tmpFile = tempnam(sys_get_temp_dir(), 'test_') . '.png';
    file_put_contents($tmpFile, base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    ));
    
    $ch = curl_init('http://127.0.0.1:8000/api/upload');
    $postFields = ['file' => new CURLFile($tmpFile, 'image/png', 'test.png')];
    
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Accept: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    unlink($tmpFile);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data['success'] ?? false) {
            echo "   Uploaded URL: " . ($data['data']['url'] ?? 'N/A') . "\n";
            return true;
        }
    }
    
    echo "   HTTP $httpCode: " . substr($response, 0, 200) . "\n";
    return false;
}

/**
 * Test avatar upload
 */
function testAvatarUpload($token) {
    $tmpFile = tempnam(sys_get_temp_dir(), 'avatar_') . '.png';
    file_put_contents($tmpFile, base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    ));
    
    $ch = curl_init('http://127.0.0.1:8000/api/auth/avatar');
    $postFields = ['avatar' => new CURLFile($tmpFile, 'image/png', 'avatar.png')];
    
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Accept: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    unlink($tmpFile);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data['avatar_url'] ?? $data['avatar_data'] ?? false) {
            echo "   Avatar uploaded successfully\n";
            return true;
        }
    }
    
    echo "   HTTP $httpCode: " . substr($response, 0, 200) . "\n";
    return false;
}

/**
 * Test get profile
 */
function testGetProfile($token) {
    $ch = curl_init('http://127.0.0.1:8000/api/auth/me');
    
    curl_setopt_array($ch, [
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Accept: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        $hasAvatar = $data['avatar_url'] ?? $data['avatar_data'] ?? $data['avatar_mime_type'] ?? false;
        if ($hasAvatar) {
            echo "   Avatar data present in profile\n";
        } else {
            echo "   ⚠️ No avatar data (may need upload first)\n";
        }
        return true;
    }
    
    echo "   HTTP $httpCode: " . substr($response, 0, 200) . "\n";
    return false;
}
