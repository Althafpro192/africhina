<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Request as RFQRequest;
use App\Models\TrackingLog;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@africhina.com'],
            [
                'full_name' => 'AfriChina Administrator',
                'password_hash' => Hash::make('password123'),
                'role' => 'admin',
                'country' => 'Indonesia',
                'country_code' => '+62',
                'phone' => '81234567890',
                'company_name' => 'AfriChina Bridge Admin',
            ]
        );

        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'full_name' => 'Admin Example',
                'password_hash' => Hash::make('password123'),
                'role' => 'admin',
                'country' => 'Indonesia',
                'country_code' => '+62',
                'phone' => '81234567891',
                'company_name' => 'AfriChina Admin Example',
            ]
        );

        // 2. Demo Buyer Users
        $buyer = User::firstOrCreate(
            ['email' => 'buyer@africhina.com'],
            [
                'full_name' => 'Kwame Osei',
                'password_hash' => Hash::make('password123'),
                'role' => 'buyer',
                'country' => 'Ghana',
                'country_code' => '+233',
                'phone' => '241234567',
                'company_name' => 'West Africa Traders Ltd',
            ]
        );

        User::firstOrCreate(
            ['email' => 'buyer@example.com'],
            [
                'full_name' => 'Demo Buyer',
                'password_hash' => Hash::make('password123'),
                'role' => 'buyer',
                'country' => 'Indonesia',
                'country_code' => '+62',
                'phone' => '89876543210',
                'company_name' => 'Demo Buyer Ltd',
            ]
        );

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'full_name' => 'Test User',
                'password_hash' => Hash::make('password123'),
                'role' => 'buyer',
                'country' => 'Indonesia',
                'country_code' => '+62',
                'phone' => '81111111111',
                'company_name' => 'Test User Company',
            ]
        );

        // 3. Sample Suppliers
        $supplier1 = Supplier::firstOrCreate(
            ['company_name' => 'Guangzhou Industrial Machinery Co., Ltd.'],
            [
                'category' => 'Heavy Machinery',
                'contact_person' => 'Chen Wei',
                'phone_china' => '+86 138 0000 1111',
                'email' => 'sales@gzmachinery.cn',
                'factory_address' => 'Panyu District, Guangzhou, Guangdong, China',
                'verification_level' => 'Verified Factory',
                'avg_rating' => 4.8,
                'notes' => 'Top manufacturer of industrial printing and packaging machinery.',
            ]
        );

        $supplier2 = Supplier::firstOrCreate(
            ['company_name' => 'Yiwu Smart Solar Technology Co., Ltd.'],
            [
                'category' => 'Solar Energy',
                'contact_person' => 'Li Na',
                'phone_china' => '+86 139 2222 3333',
                'email' => 'info@yiwusolar.com',
                'factory_address' => 'Yiwu International Trade City, Zhejiang, China',
                'verification_level' => 'Verified Factory',
                'avg_rating' => 4.9,
                'notes' => 'Specializes in solar panels and inverter systems.',
            ]
        );

        // 4. Sample RFQ Request
        $rfq = RFQRequest::firstOrCreate(
            [
                'user_id' => $buyer->id,
                'product_name' => 'High-Capacity Solar Inverter System (10kW)',
            ],
            [
                'category' => 'Solar Energy',
                'sub_category' => 'Inverters',
                'specifications' => 'Hybrid 10kW 3-phase inverter, IP65 waterproof rating, dual MPPT controller.',
                'quantity' => 50,
                'unit' => 'units',
                'budget_range' => '$10,000 - $25,000',
                'shipping_terms' => 'FOB Guangzhou',
                'payment_terms' => 'Escrow / Wire Transfer',
                'status' => 'menunggu_penawaran_admin',
                'assigned_supplier_id' => $supplier2->id,
            ]
        );

        TrackingLog::firstOrCreate(
            ['request_id' => $rfq->id, 'status' => 'menunggu_penawaran_admin'],
            ['notes' => 'Sample RFQ initialized. Awaiting admin review and options.']
        );
    }
}

