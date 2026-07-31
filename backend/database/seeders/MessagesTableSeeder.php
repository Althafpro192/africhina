<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MessagesTableSeeder extends Seeder
{
    public function run(): void
    {
        // Hapus semua data lama
        Message::truncate();

        // Ambil user yang ada (pastikan sudah dibuat di seeder User)
        $buyer1 = User::where('email', 'buyer@africhina.com')->first();
        $buyer2 = User::where('email', 'test@buyer.com')->first();
        $admin = User::where('role', 'admin')->first();

        if (!$buyer1 && !$buyer2) {
            // Jika user belum ada, buat dummy users untuk testing
            $buyer1 = User::firstOrCreate(
                ['email' => 'buyer@africhina.com'],
                [
                    'full_name' => 'Kwame Osei',
                    'password_hash' => bcrypt('password123'),
                    'country' => 'Ghana',
                    'phone' => '241234567',
                    'company_name' => 'West Africa Traders Ltd',
                    'role' => 'buyer',
                    'country_code' => '+233',
                ]
            );

            $buyer2 = User::firstOrCreate(
                ['email' => 'test@buyer.com'],
                [
                    'full_name' => 'Test Buyer',
                    'password_hash' => bcrypt('password123'),
                    'country' => 'Indonesia',
                    'phone' => '8123456789',
                    'company_name' => 'Test Buyer Company',
                    'role' => 'buyer',
                    'country_code' => '+62',
                ]
            );
        }

        if (!$admin) {
            $admin = User::firstOrCreate(
                ['email' => 'admin@africhina.com'],
                [
                    'full_name' => 'Admin AfriChina',
                    'password_hash' => bcrypt('admin123'),
                    'country' => 'Indonesia',
                    'phone' => '8123456780',
                    'company_name' => 'AfriChina Admin',
                    'role' => 'admin',
                    'country_code' => '+62',
                ]
            );
        }

        // Gambar 1x1 pixel PNG (Base64) - sangat kecil
        // Format: data:image/png;base64,{base64_data}
        $tinyImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        // Gambar kecil JPG
        $tinyJpgBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=';

        // Data pesan dummy
        $messages = [
            [
                'id' => Str::uuid()->toString(),
                'buyer_id' => $buyer1->id ?? null,
                'sender_id' => $buyer1->id ?? null,
                'request_id' => null,
                'content' => 'Halo, ini pesan pertama dengan gambar kecil',
                'translations' => json_encode(['en' => 'Hello, first message with small image', 'id' => 'Halo, pesan pertama dengan gambar kecil', 'fr' => 'Bonjour, premier message avec petite image', 'zh' => '你好，第一条带小图片的消息']),
                'media_url' => $tinyImageBase64,
                'media_type' => 'image',
                'is_edited' => false,
                'is_deleted' => false,
                'created_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'buyer_id' => $buyer2->id ?? null,
                'sender_id' => $buyer2->id ?? null,
                'request_id' => null,
                'content' => 'Pesan dari buyer kedua dengan lampiran',
                'translations' => json_encode(['en' => 'Message from second buyer with attachment', 'id' => 'Pesan dari buyer kedua dengan lampiran', 'fr' => 'Message du second acheteur avec piece jointe', 'zh' => '来自第二个买家的附件消息']),
                'media_url' => $tinyJpgBase64,
                'media_type' => 'image',
                'is_edited' => false,
                'is_deleted' => false,
                'created_at' => now()->subMinutes(5),
            ],
            [
                'id' => Str::uuid()->toString(),
                'buyer_id' => $buyer1->id ?? null,
                'sender_id' => $admin->id,
                'request_id' => null,
                'content' => 'Balasan admin dengan gambar produk',
                'translations' => json_encode(['en' => 'Admin reply with product image', 'id' => 'Balasan admin dengan gambar produk', 'fr' => 'Reponse admin avec image produit', 'zh' => '管理员回复产品图片']),
                'media_url' => $tinyImageBase64,
                'media_type' => 'image',
                'is_edited' => false,
                'is_deleted' => false,
                'created_at' => now()->subMinutes(3),
            ],
            [
                'id' => Str::uuid()->toString(),
                'buyer_id' => $buyer1->id ?? null,
                'sender_id' => $buyer1->id ?? null,
                'request_id' => null,
                'content' => 'Terima kasih atas informasinya!',
                'translations' => json_encode(['en' => 'Thank you for the information!', 'id' => 'Terima kasih atas informasinya!', 'fr' => 'Merci pour les informations!', 'zh' => '感谢您的信息！']),
                'media_url' => null,
                'media_type' => null,
                'is_edited' => false,
                'is_deleted' => false,
                'created_at' => now()->subMinutes(2),
            ],
            [
                'id' => Str::uuid()->toString(),
                'buyer_id' => $buyer2->id ?? null,
                'sender_id' => $admin->id,
                'request_id' => null,
                'content' => 'Silakan hubungi kami jika ada pertanyaan lebih lanjut.',
                'translations' => json_encode(['en' => 'Please contact us if you have further questions.', 'id' => 'Silakan hubungi kami jika ada pertanyaan lebih lanjut.', 'fr' => 'N\'hesitez pas a nous contacter pour toute question.', 'zh' => '如有其他问题，请与我们联系。']),
                'media_url' => null,
                'media_type' => null,
                'is_edited' => false,
                'is_deleted' => false,
                'created_at' => now()->subMinutes(1),
            ],
        ];

        foreach ($messages as $msg) {
            Message::create($msg);
        }

        $this->command->info('MessagesTableSeeder: Created ' . count($messages) . ' messages with test images.');
    }
}
