REVISED PRODUCT REQUIREMENTS DOCUMENT (RPD) v2.0
AFRI CHINA BRIDGE - FINAL BUSINESS WORKFLOW
Tanggal Berlaku: 18 Juli 2026
Status: Final (Menggantikan semua versi RPD sebelumnya)
Tujuan: Menjadi satu-satunya acuan mutlak untuk debugging, analisis kode, dan penyelesaian proyek AfriChina Bridge.

1. EXECUTIVE SUMMARY & MODEL BISNIS
AfriChina Bridge adalah platform B2B dengan model "Jastip (Jasa Titip) Premium berskala besar".

Admin Internal adalah pusat kendali. Admin bertindak seperti "jastip" yang mencari supplier China, menawarkan beberapa pilihan produk, bernegosiasi, dan mengurus logistik.

Buyer (Importir Afrika) adalah customer yang meminta barang, memilih opsi yang ditawarkan Admin, melakukan pembayaran ke rekening perusahaan (Admin), dan menerima barang.

Supplier China berada di belakang layar dan hanya berinteraksi dengan Admin, bukan dengan Buyer.

Perbedaan Kritis dengan RPD Lama: Konsep "Multi-Opsi Produk", "Trigger Kolom Bayar", "Verifikasi 2 Langkah untuk Konfirmasi Tiba", dan "Moderasi Rating" adalah fitur wajib yang harus ada di versi final ini.

2. ALUR BISNIS UTAMA (THE GOLDEN PATH)
Ini adalah alur yang WAJIB diikuti oleh sistem. Setiap penyimpangan dari alur ini adalah BUG KRITIS.

Tahap	Pelaku	Aksi	Status Sistem (Database)	Trigger UI / Catatan Khusus
1	Buyer	Mengisi Form RFQ (permintaan barang)	menunggu_penawaran_admin	-
2	Admin	Mencari supplier & menambahkan 2-3 Opsi Produk (Nama, Deskripsi, Gambar, Kisaran Harga) ke dalam sistem	menunggu_pemilihan_buyer	WAJIB: Sistem harus support multiple options per 1 Request.
3	Buyer	Melihat daftar opsi di halaman detail, lalu memilih salah satu opsi yang paling sesuai	menunggu_kesepakatan_final	Tombol "Pilih Opsi Ini" hanya muncul jika status menunggu_pemilihan_buyer.
4	Admin & Buyer	Berkomunikasi/negosiasi melalui Fitur Chat di halaman detail yang sama	menunggu_kesepakatan_final	Chat harus real-time dan terintegrasi di halaman detail, bukan di halaman terpisah.
5	Admin	Menekan tombol "Finalisasi Kesepakatan"	menunggu_pembayaran	WAJIB: Pada saat ini, otomatis muncul Kolom "Upload Bukti Bayar" di sisi Buyer. Sebelum tombol ini ditekan, kolom tersebut HARAM (tidak boleh) terlihat oleh Buyer.
6	Buyer	Mentransfer uang ke rekening AfriChina, lalu mengunggah bukti transfer	menunggu_verifikasi_pembayaran	-
7	Admin	Memeriksa bukti transfer. Jika cocok, klik "Konfirmasi Pembayaran Diterima"	sedang_diproses	Hanya Admin yang bisa mengubah status ini.
8	Admin	Membeli ke supplier, mengurus produksi, dan mengunggah resi pengiriman (tracking number)	dikirim	-
9	Buyer	Barang fisik sudah sampai di tangan Buyer. Buyer menekan tombol "Konfirmasi Barang Tiba"	menunggu_verifikasi_admin	PERHATIAN! Status TIDAK LANGSUNG menjadi selesai. Ini adalah poin kritis untuk mencegah penyalahgunaan.
10	Admin	Mengecek dokumen pengiriman (Bill of Lading, foto barang). Jika sesuai, Admin menekan "Selesaikan Order"	selesai	Hanya Admin yang bisa menutup order.
11	Buyer	Setelah status selesai, secara otomatis muncul Form Rating & Komentar di halaman Buyer	selesai	Form rating HANYA muncul di tahap ini.
12	Admin	Di dashboard admin, melihat daftar rating baru dengan status menunggu_moderasi. Admin memilih "Publikasikan" atau "Sembunyikan"	is_published = true atau false	-
13	Publik	Halaman Landing Page (sebelum login) menampilkan daftar rating dengan status is_published = true	-	Hanya rating yang dipublikasi yang muncul di depan umum.
3. DAFTAR STATUS RESMI (DATABASE ENUM / CONSTRAINT)
Sistem WAJIB menggunakan status-status di bawah ini secara berurutan. Tidak boleh ada lompatan status yang tidak valid (misal: dari dikirim langsung ke selesai tanpa melalui menunggu_verifikasi_admin).

menunggu_penawaran_admin (Buyer submit RFQ)

menunggu_pemilihan_buyer (Admin sudah kasih opsi)

menunggu_kesepakatan_final (Buyer sudah pilih opsi, sedang negosiasi/chat)

menunggu_pembayaran (Admin finalisasi deal, menunggu transfer buyer)

menunggu_verifikasi_pembayaran (Buyer upload bukti, menunggu admin cek)

sedang_diproses (Admin sudah verifikasi pembayaran, mulai produksi)

dikirim (Admin sudah kirim barang dan upload resi)

menunggu_verifikasi_admin (Buyer konfirmasi barang tiba, menunggu admin cek dokumen) ← STATUS BARU WAJIB!

selesai (Admin sudah verifikasi dan menutup order)

Status Tambahan:

batal (Dibatalkan oleh buyer/admin)

dispute (Jika terjadi sengketa/komplain)

4. ATURAN MAIN (BUSINESS RULES) YANG HARUS DIPERIKSA OLEH AI
Berikut adalah aturan-aturan mutlak yang harus dieksekusi oleh sistem. Jika AI menemukan kode yang melanggar aturan ini, maka kode tersebut WAJIB diperbaiki.

[RULE-01] Larangan Update Langsung ke Selesai: Fungsi confirmDelivery (atau apapun namanya) di backend DILARANG KERAS untuk mengubah status menjadi selesai. Wajib mengubah ke menunggu_verifikasi_admin.

[RULE-02] Trigger Upload Bukti Bayar: Kolom upload bukti bayar di Frontend HANYA boleh muncul jika ada flag/catatan bahwa Admin telah menekan "Finalisasi". Gunakan field deal_finalized_at di database atau status spesifik menunggu_pembayaran yang hanya bisa dicapai melalui aksi admin.

[RULE-03] Moderasi Rating: Query untuk menampilkan rating di Landing Page WAJIB menyertakan filter WHERE is_published = true. Tanpa filter ini, semua rating (termasuk negatif) akan muncul, yang melanggar aturan moderasi.

[RULE-04] Validasi Role: Buyer TIDAK BOLEH memiliki akses ke endpoint yang mengubah status menjadi sedang_diproses, dikirim, atau selesai. Hanya Admin yang boleh mengakses endpoint-status kritis tersebut.

[RULE-05] Multi-Opsi Produk: Sistem WAJIB memiliki struktur data (tabel) untuk menampung lebih dari 1 opsi produk per request_id. Jika saat ini hanya ada 1 kolom product_name di tabel requests, itu adalah Missing Feature kritis.

5. KEBUTUHAN DATABASE (WAJIB DIPERIKSA & DITAMBAHKAN)
AI yang menganalisis proyek ini WAJIB memastikan keberadaan elemen database berikut:

Tabel request_options: (Relasi one-to-many dengan requests) Berisi kolom: id, request_id, product_name, description, image_url, price_min, price_max.

Tabel reviews: Berisi kolom: id, request_id (atau order_id), buyer_id, rating (int 1-5), comment (text), is_published (boolean, default false), created_at. Field is_published ini adalah kunci moderasi.

Tabel requests: Pastikan ada kolom tambahan deal_finalized_at (timestamp, nullable) untuk menjadi pemicu munculnya form upload bukti bayar di sisi Buyer.

Constraint Status: Ubah kolom status dari VARCHAR biasa menjadi ENUM atau tambahkan CHECK CONSTRAINT agar hanya 9 status di atas yang bisa masuk.

6. TUGAS KHUSUS UNTUK AI (ANALISIS & EKSEKUSI)
Kepada AI (AntiGravity IDE / Cursor / ChatGPT) yang bertugas menyelesaikan proyek ini, lakukan hal berikut secara berurutan:

Audit Kode Menyeluruh:

Scan seluruh file backend/controllers/ dan backend/routes/. Temukan semua fungsi yang mengubah status requests atau orders.

Scan seluruh file frontend/src/views/buyer/ dan frontend/src/components/. Temukan semua tombol aksi buyer.

Perbaiki Logika Backend (Prioritas Utama):

Jika ditemukan fungsi confirmDelivery yang langsung menuju completed/selesai, rewrite fungsi tersebut menjadi menunggu_verifikasi_admin.

Buat endpoint baru untuk Admin: PUT /api/admin/orders/:id/finalize yang khusus mengubah status menjadi selesai (hanya bisa diakses role admin).

Buat endpoint untuk Admin: PUT /api/admin/reviews/:id/toggle-publish untuk mengubah status is_published.

Perbaiki Logika Frontend (Prioritas Kedua):

Di halaman RequestDetail.vue Buyer, tambahkan logika v-if untuk menyembunyikan form upload bukti bayar sampai kondisi request.deal_finalized_at !== null atau status menunggu_pembayaran terpenuhi dari jalur Admin.

Di halaman RequestDetail.vue Buyer, pindahkan Form Rating ke dalam kondisi v-if="request.status === 'selesai'".

Di halaman Landing Page (index.vue), pastikan pemanggilan API rating menyertakan parameter ?published_only=true atau filter di backend.

Perbaiki Database Migration:

Buat migration untuk menambah tabel request_options dan reviews jika belum ada.

Buat migration untuk menambah kolom deal_finalized_at di tabel requests.

Laporkan Hasil:

Buat laporan "Gap Analysis" yang berisi daftar file yang diubah, fungsi yang dihapus/ditambahkan, dan status terkini proyek.

7. DESIGN & UI REQUIREMENTS (INTEGRASI CHAT & OPSI)
Halaman Detail Request: Harus menjadi pusat kendali. Di halaman ini, Buyer harus bisa melihat:

Daftar Kartu Opsi Produk (dari tabel request_options).

Tombol Pilih Opsi.

Komponen Chat (terintegrasi di bawah/atas halaman yang sama).

Kolom Upload Bukti Bayar (kondisional).

Form Rating (kondisional).

Dashboard Admin: Harus menampilkan daftar "Rating Menunggu Moderasi" yang dilengkapi tombol "Terbitkan" dan "Tolak/Sembunyikan".

Penutup:
RPD ini adalah hukum tertinggi untuk pengembangan AfriChina Bridge. AI tidak boleh menambahkan fitur di luar alur ini tanpa persetujuan, dan harus memastikan setiap baris kode yang ada saat ini selaras dengan 13 Tahapan Alur Bisnis di atas. Tujuan akhir dari RPD ini adalah menjadikan proyek AfriChina Bridge 100% selesai dan bebas bug alur bisnis.

