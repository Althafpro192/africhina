<?php
/**
 * Script untuk membuat test users
 * Usage: php backend/create-test-users.php
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Clear existing test users
User::where('email', 'test@buyer.com')->delete();
User::where('email', 'test@admin.com')->delete();
User::where('email', 'demo@buyer.com')->delete();
User::where('email', 'demo@admin.com')->delete();

// Create test buyer
$buyer = User::create([
    'full_name' => 'Test Buyer',
    'email' => 'test@buyer.com',
    'password_hash' => Hash::make('password123'),
    'role' => 'buyer',
    'country' => 'Indonesia',
    'country_code' => '+62',
    'phone' => '8123456789',
    'company_name' => 'Test Buyer Company',
    'password_changed_at' => now(),
]);

echo "✅ Test Buyer created:\n";
echo "   Email: test@buyer.com\n";
echo "   Password: password123\n\n";

// Create test admin
$admin = User::create([
    'full_name' => 'Test Admin',
    'email' => 'test@admin.com',
    'password_hash' => Hash::make('admin123'),
    'role' => 'admin',
    'country' => 'Indonesia',
    'country_code' => '+62',
    'phone' => '8123456780',
    'company_name' => 'AfriChina Admin',
    'password_changed_at' => now(),
]);

echo "✅ Test Admin created:\n";
echo "   Email: test@admin.com\n";
echo "   Password: admin123\n\n";

// Create demo buyer
$demo = User::create([
    'full_name' => 'Demo Buyer',
    'email' => 'demo@buyer.com',
    'password_hash' => Hash::make('demo123'),
    'role' => 'buyer',
    'country' => 'Indonesia',
    'country_code' => '+62',
    'phone' => '8123456781',
    'company_name' => 'Demo Company',
    'password_changed_at' => now(),
]);

echo "✅ Demo Buyer created:\n";
echo "   Email: demo@buyer.com\n";
echo "   Password: demo123\n\n";

echo "🎉 All test users created successfully!\n";
