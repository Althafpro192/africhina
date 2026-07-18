LAPORAN AUDIT TEKNIS & REKOMENDASI – AfriChina Bridge
Tanggal: 18 Juli 2026
Auditor: Claude Opus (AI Architect & Product Consultant)
Versi Proyek: v1.0.0
Branch: antigravity

1. EKSEKUTIF SUMMARY
AfriChina Bridge adalah proyek yang ambisius dan memiliki fondasi arsitektur yang solid. Monolith pattern (frontend build → backend static serve) sudah diterapkan dengan benar, autentikasi via HttpOnly Cookie sudah diimplementasikan, dan alur bisnis 13-tahap (Golden Path) sudah terbentuk dengan mekanisme state machine yang fungsional di backend. Smoke Test QA 8/8 juga menunjukkan infrastruktur dasar sudah stabil.

Namun, audit ini menemukan 3 blocker kritis yang akan menyebabkan crash di production, beberapa celah keamanan yang harus ditutup, dan sejumlah inkonsistensi kode yang menandakan migrasi belum sepenuhnya bersih. Proyek ini berada di status "75% siap produksi" — fondasi kuat tetapi memerlukan perbaikan sebelum bisa di-deploy ke pengguna nyata.

2. HASIL TINJAUAN PER ASPEK
A. Arsitektur & Struktur Kode
Temuan
Struktur folder sudah sesuai blueprint: frontend/src/views/admin/, frontend/src/views/buyer/, frontend/src/views/auth/, frontend/src/components/ui/, frontend/src/components/layout/ — semua tersusun rapi.

Komponen UI (BaseButton, BaseCard) baru dibuat tetapi belum digunakan secara konsisten di halaman-halaman yang sudah ada sebelumnya. Hanya LandingPage.vue yang menggunakannya. Halaman buyer dan admin masih menggunakan inline button styles.

Pinia (state management) tidak digunakan sama sekali. Seluruh state management dilakukan via:

localStorage.getItem('user') untuk autentikasi (di router guard)
Komponen-level ref() untuk data
Tidak ada shared state antar komponen
File-file "sisa" ditemukan di root project yang seharusnya tidak ada:

rewrite_admin.js (25KB) — tampaknya file sementara/scratch
rewrite_buyer.js (25KB)
update_admin_detail.js (3.4KB)
reset-pass-buyer.cjs, reset-pass.cjs, test-hash.cjs di backend/
rewrite_ratings.cjs di backend/
Duplikasi logika: Import statement di route files ditempatkan di tengah file (bukan di atas), contoh 
admin.js:L13
 dan 
requests.js:L12
.

Rekomendasi
IMPORTANT

Pinia belum mendesak untuk skala proyek saat ini, tetapi WAJIB ditambahkan sebelum fitur notifikasi real-time dikembangkan. Untuk saat ini, auth state via localStorage sudah cukup.

Bersihkan file sisa: Hapus rewrite_admin.js, rewrite_buyer.js, update_admin_detail.js, reset-pass-buyer.cjs, reset-pass.cjs, test-hash.cjs, rewrite_ratings.cjs.
Standarisasi import: Pindahkan semua import statement ke bagian atas file.
Adopsi BaseButton/BaseCard secara bertahap ke seluruh halaman admin dan buyer.
B. Kualitas Frontend (Vue 3 Composition API)
Temuan
Tidak ada <MainLayout> wrapper. Buyer pages menggunakan BuyerLayout.vue sebagai wrapper, tetapi Admin pages (Dashboard.vue, RequestDetail.vue) mengelola sidebar dan header sendiri secara inline. Ini menyebabkan duplikasi kode sidebar ±80 baris antara admin Dashboard dan admin RequestDetail.

i18n: Sebagian besar teks UI sudah menggunakan $t(). Namun:

Landing page i18n belum ditambahkan ke zh.json dan fr.json (0 entri landing).
Beberapa teks di LandingPage.vue masih hardcoded: "Why AfriChina Bridge?", "Live Tracking View", step names dalam loop, testimoni quotes.
Responsivitas: Touch target sudah memadai (≥44px) berkat min-h-[44px]/py-3 di tombol. Namun, landing page hero section pada layar kecil (375px) memiliki text-5xl heading yang bisa terlalu besar.

Performa: Tidak ditemukan memory leak yang jelas. Semua event listener di-cleanup via onUnmounted. Lazy loading via dynamic import() sudah diterapkan di router.

Axios interceptor masih mereferensikan localStorage.removeItem('token') di 
axios.js:L22
, padahal token tidak pernah disimpan di localStorage (sudah di HttpOnly cookie). Ini adalah dead code yang membingungkan.

Rekomendasi
Buat AdminLayout.vue yang mirip dengan BuyerLayout.vue untuk menghilangkan duplikasi sidebar di semua halaman admin.
Lengkapi i18n untuk zh.json dan fr.json — minimal duplikasi dari en.json agar tidak crash saat user ganti bahasa.
Hapus localStorage.removeItem('token') dari axios interceptor — bersihkan referensi ke pola autentikasi lama.
C. Kualitas Backend (Node.js + Express)
Temuan
CAUTION

BUG KRITIS #1: Inkonsistensi nama kolom user_id vs buyer_id

Tabel requests di 
init.sql:L32
 menggunakan kolom user_id, tetapi beberapa controller merujuk ke buyer_id:

requestController.js:L141
: WHERE id = $1 AND buyer_id = $2
requestController.js:L185
: WHERE id = $1 AND buyer_id = $2
requestController.js:L194
: WHERE id = $1 AND buyer_id = $2
Fungsi updateRequest() dan deleteRequest() akan CRASH dengan PostgreSQL error karena kolom buyer_id tidak ada di tabel requests.

CAUTION

BUG KRITIS #2: Skema database tidak sinkron dengan kode

Beberapa kolom/tabel yang digunakan oleh controller tidak ada di init.sql:

request_options — tabel tidak didefinisikan di init.sql
messages — tabel tidak didefinisikan di init.sql
deal_finalized_at — kolom tidak ada di tabel requests
selected_option_id — kolom tidak ada di tabel requests
payment_proof_url — kolom tidak ada di tabel requests
is_published — kolom tidak ada di tabel ratings
Controller-controller ini akan menghasilkan "column does not exist" error jika dijalankan terhadap database yang di-setup dari init.sql.

Validasi input sangat minim. Contoh:

authController.js:L7
: register() tidak memvalidasi format email, panjang password minimum, atau field wajib.
requestController.js:L33
: createRequest() tidak memvalidasi product_name atau category — bisa kosong.
Tidak ada library validasi (seperti express-validator atau joi).
Error handling aman: Semua error mengembalikan pesan generik "Internal Server Error" tanpa stack trace — ini sudah baik. Logging ke winston juga sudah benar.

Connection pooling sudah efisien via pg.Pool di 
db.js
. Beberapa controller menggunakan pool.connect() + transaction pattern dengan benar (contoh: 
paymentController.js
).

Nodemailer menggunakan smtp.ethereal.email (testing SMTP) — ini benar untuk development, tetapi harus diganti untuk production.

Tidak ada global error handler (Express error middleware app.use((err, req, res, next))), sehingga error dari multer file upload (misalnya file terlalu besar) akan menghasilkan HTML error page default.

Rekomendasi
javascript

// PERBAIKAN KRITIS: Ganti buyer_id → user_id di requestController.js
// Baris 141:
const requestCheck = await client.query('SELECT * FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
// Baris 185:
const requestCheck = await pool.query('SELECT status FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
// Baris 194:
await pool.query('DELETE FROM requests WHERE id = $1 AND user_id = $2', [id, req.userId]);
Buat migrasi SQL lengkap yang menambahkan tabel dan kolom yang hilang: request_options, messages, kolom deal_finalized_at, selected_option_id, payment_proof_url, is_published.
Tambahkan input validation minimal via express-validator.
Tambahkan global error handler di server.js:
javascript

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});
Tambahkan helmet untuk security headers.
D. UI/UX & Design System
Temuan
Glassmorphism sudah diterapkan secara konsisten di buyer pages (BuyerLayout.vue → .glass-header, .glass-sidebar) dan admin pages (inline styles).

Warna status belum terstandarisasi ke satu sumber kebenaran. Setiap halaman (Dashboard, RequestDetail) mendefinisikan map status → warna secara lokal. Jika ada perubahan warna, harus diubah di banyak tempat.

Aksesibilitas (WCAG) sangat minim:

Tidak ada aria-label pada tombol ikon (material-symbols-outlined).
Tidak ada role attribute pada navigasi.
Kontras warna di glass-panel (teks abu-abu di atas background semi-transparan) mungkin gagal WCAG AA ratio.
Tidak ada keyboard navigation (focus styles, tab order).
Design system belum formalisasi: Tidak ada file design tokens (warna, spacing, typography) yang terpusat. Semuanya inline di komponen.

Rekomendasi
Buat file design-tokens.css atau perluas style.css dengan CSS custom properties:
css

:root {
  --color-primary: #4f46e5;
  --color-primary-dark: #3525cd;
  --color-surface: rgba(255, 255, 255, 0.7);
  /* dll */
}
Tambahkan aria-label minimal pada semua tombol ikon dan navigasi.
E. Keamanan
Temuan
JWT disimpan di HttpOnly Cookie ✅ — ini sudah benar. Login.vue hanya menyimpan user (profil, bukan token) di localStorage.

CORS dikonfigurasi dengan origin: '*' dan credentials: true di 
server.js:L69-72
.

WARNING

origin: '*' + credentials: true adalah kombinasi BERBAHAYA. Browser modern akan memblokir cookie cross-origin jika origin adalah wildcard. Untuk production, CORS harus menggunakan origin eksplisit (misal: origin: 'https://africhinabridge.com').

Password di-hash dengan bcrypt salt rounds 10 ✅ — sudah memadai.

Potensi SQL injection: RENDAH. Semua query menggunakan parameterized queries ($1, $2, ...). Tidak ditemukan string concatenation langsung.

Upload files:

Sudah ada fileFilter yang membatasi MIME type ke JPEG, PNG, PDF ✅
Sudah ada fileSize limit 5MB ✅
TAPI: Folder /uploads di-serve sebagai static tanpa rate limiting atau access control. Siapapun yang tahu URL file bisa mengakses.
Tidak ada helmet middleware — header keamanan standar (X-Content-Type-Options, X-Frame-Options, dll) tidak di-set.

Socket.IO auth memiliki fallback || 'secret' di 
server.js:L42
 — jika JWT_SECRET env kosong, ini menjadi celah.

Rekomendasi
Ganti CORS wildcard dengan daftar origin eksplisit (atau pakai fungsi dinamis).
Install dan gunakan helmet:
bash

npm install helmet
javascript

import helmet from 'helmet';
app.use(helmet());
Hapus fallback || 'secret' dari Socket.IO auth.
Pertimbangkan menambahkan middleware autentikasi pada route /uploads untuk file sensitif.
F. Fitur Bisnis & Proses
Temuan
Alur Golden Path (13 Tahapan) sudah terbentuk di backend:

menunggu_penawaran_admin → menunggu_pemilihan_buyer → menunggu_kesepakatan_final → menunggu_pembayaran → menunggu_verifikasi_pembayaran → sedang_diproses → dikirim → menunggu_verifikasi_admin → selesai
Status alternatif: batal, dispute
Masing-masing transisi dijaga oleh guard clause di controller.
Visual Timeline: Frontend RequestDetail.vue (buyer) sudah membaca tracking_logs dan menampilkannya. Namun, mapping label status ke tampilan human-readable perlu dipastikan lengkap.

Rating system sudah dirancang dengan tabel ratings, controller untuk create/read, dan admin moderation (togglePublishRating). Tetapi: kolom is_published belum ada di schema init.sql.

Internal notes: Kolom internal_notes ada di tabel requests dan bisa diupdate via updateAdminRequest. Di frontend buyer RequestDetail.vue, assigned_supplier_id di-delete dari response — ini sudah sesuai prinsip "Jastip Buta". Tetapi internal_notes masih dikirim dalam response getRequestById buyer — ini SEHARUSNYA juga di-filter.

Tawk.to: Terintegrasi via script tag di index.html, sudah dibungkus try-catch. ID masih dummy.

Nodemailer: Fungsional via Ethereal (testing). Perlu konfigurasi SMTP production.

Rekomendasi
WARNING

Internal notes bocor ke buyer! Tambahkan delete responseData.internal_notes; di 
requestController.js:L91
, tepat setelah delete responseData.assigned_supplier_id;.

Buat migrasi SQL untuk menambahkan kolom is_published ke tabel ratings.
Konfigurasi Tawk.to dengan ID production yang valid.
G. Deployment & Operasional
Temuan
Docker: docker-compose.yml sudah ada dan terkonfigurasi untuk 3 service (db, backend, frontend). Tetapi: Dockerfile di backend kosong (0 byte). Frontend belum punya Dockerfile.

Logging: Winston sudah dikonfigurasi dengan file transport (combined.log, error.log) + console transport untuk development. Morgan HTTP logging juga aktif. Ini sudah baik. Namun, combined.log sudah mencapai 873KB — tidak ada log rotation.

Tidak ada strategi backup database yang terdokumentasi.

Tidak ada healthcheck endpoint yang memeriksa database. /health hanya mengembalikan { status: 'ok' } tanpa verifikasi koneksi DB.

Rekomendasi
Isi Dockerfile backend:
dockerfile

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
Tambahkan log rotation via winston maxsize dan maxFiles option.
Perkaya healthcheck:
javascript

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});
3. JAWABAN PERTANYAAN SPESIFIK
1. Skor Keseluruhan: 6.5 / 10
Aspek	Skor	Alasan
Arsitektur	7/10	Monolith pattern solid, folder structure rapi, tapi belum ada shared layout admin
Frontend	7/10	Vue 3 Composition API digunakan dengan benar, i18n sebagian besar diterapkan
Backend	5/10	Bug kritis user_id/buyer_id + schema tidak sinkron → crash di production
Keamanan	6/10	HttpOnly cookie ✅, tapi CORS wildcard + no helmet + internal notes bocor
UI/UX	7/10	Glassmorphism konsisten, mobile-ready, tapi aksesibilitas minim
Fitur Bisnis	7/10	Golden Path lengkap, rating ada, payment flow ada
DevOps	4/10	Docker kosong, no log rotation, no DB backup
2. Tiga Risiko Terbesar
🔴 BLOCKER: Schema database tidak sinkron dengan kode. Tabel request_options, messages, dan kolom deal_finalized_at, selected_option_id, payment_proof_url, is_published tidak ada di init.sql. Deployment baru dari nol akan gagal total.

🔴 BLOCKER: Kolom buyer_id tidak ada di tabel requests. Fungsi updateRequest(), deleteRequest() di requestController.js akan crash.

🟡 HIGH: Internal notes (internal_notes) bocor ke buyer. Data yang seharusnya hanya terlihat oleh admin dikirimkan ke response buyer — melanggar prinsip "Jastip Buta".

3. Fitur Baru yang Disarankan
a) Dashboard Analytics untuk Admin (Prioritas: TINGGI)
Mengapa: Admin perlu melihat tren pesanan, revenue, dan performa supplier secara visual untuk pengambilan keputusan bisnis.
Implementasi: Integrasikan Chart.js (sudah ada di dependencies) ke Admin Dashboard dengan grafik: line chart order per bulan, bar chart revenue per kategori, pie chart distribusi status.

b) Notification System (In-App + Email) (Prioritas: TINGGI)
Mengapa: Buyer perlu tahu kapan ada update pada pesanan mereka tanpa harus refresh manual. Admin perlu alert saat ada RFQ baru.
Implementasi:

Buat tabel notifications (user_id, type, message, is_read, created_at)
Gunakan Socket.IO yang sudah ada untuk push real-time
Kirim email via Nodemailer untuk event kritis (pembayaran diterima, barang dikirim)
c) Export PDF Invoice & Laporan (Prioritas: SEDANG)
Mengapa: Importir membutuhkan dokumen formal (invoice, summary order) untuk keperluan bea cukai dan akuntansi.
Implementasi: Gunakan library seperti pdfkit atau puppeteer di backend untuk generate PDF dari template. Tambahkan tombol "Download PDF" di halaman RequestDetail buyer.

4. Prioritas Perbaikan (Urutan Eksekusi)
#	Prioritas	Item	Estimasi
1	🔴 BLOCKER	Fix buyer_id → user_id di requestController.js	15 menit
2	🔴 BLOCKER	Buat migrasi SQL lengkap (tabel + kolom yang hilang)	1 jam
3	🔴 BLOCKER	Tambahkan delete responseData.internal_notes di getRequestById buyer	5 menit
4	🟡 HIGH	Ganti CORS origin: '*' → origin eksplisit	15 menit
5	🟡 HIGH	Install + aktifkan helmet	15 menit
6	🟡 HIGH	Hapus fallback || 'secret' di Socket.IO auth	5 menit
7	🟡 HIGH	Tambahkan input validation (express-validator)	2 jam
8	🟡 HIGH	Buat AdminLayout.vue (eliminasi duplikasi sidebar)	2 jam
9	🟢 MEDIUM	Isi Dockerfile backend + frontend	1 jam
10	🟢 MEDIUM	Tambahkan global error handler middleware	30 menit
11	🟢 MEDIUM	Lengkapi i18n zh.json dan fr.json (landing section)	1 jam
12	🟢 MEDIUM	Log rotation untuk winston	15 menit
13	🔵 NICE	Bersihkan file sisa (rewrite_.js, test-.cjs)	10 menit
14	🔵 NICE	Tambahkan aria-label pada tombol ikon	1 jam
15	🔵 NICE	Perkaya healthcheck endpoint (cek DB)	15 menit
4. RENCANA TINDAK LANJUT (ACTION PLAN 7 HARI)
Hari 1–2: Perbaikan Blocker (WAJIB)
 Fix buyer_id → user_id di 3 lokasi requestController.js
 Buat file 03_sync_schema.sql yang menambahkan: tabel request_options, tabel messages, kolom-kolom yang hilang di requests dan ratings
 Filter internal_notes dari response buyer
 Hapus CORS wildcard, ganti dengan dynamic origin
 Install dan aktifkan helmet
Hari 3–4: Penguatan Keamanan & Kualitas Kode
 Tambahkan express-validator untuk validasi input di auth dan request routes
 Tambahkan global error handler middleware
 Hapus dead code (rewrite_*.js, localStorage.removeItem('token'))
 Perbaiki Socket.IO auth (hapus fallback secret)
Hari 5–6: Peningkatan UI & DX
 Buat AdminLayout.vue dan refactor halaman admin
 Lengkapi i18n untuk semua bahasa (zh.json, fr.json)
 Isi Dockerfile backend & frontend
 Tambahkan log rotation
Hari 7: Verifikasi & Dokumentasi
 Jalankan full test suite (manual smoke test semua alur)
 Verifikasi deployment via docker-compose
 Update PROGRESS.md dengan semua perubahan
 Siapkan .env.production.example dengan konfigurasi production
NOTE

Laporan ini didasarkan pada code review statis terhadap seluruh file di repository. Beberapa temuan terkait database (kolom yang hilang) mungkin sudah di-handle via ALTER TABLE manual yang belum terdokumentasi di SQL files. Disarankan untuk menjalankan \d requests di psql untuk memverifikasi skema aktual.