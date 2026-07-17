Proyek: AfriChina Bridge (v1.0.0)
Arsitektur: Vue 3 (Composition API) + Tailwind CSS + Node.js (Express) + PostgreSQL
Status: Pengembangan Dimulai (Pasca-Perbaikan QA Blocker)
Dokumen Pengendali: progres.md (Wajib di-update setiap kali commit)

🏗️ 0. ATURAN EMAS (GOLDEN RULE) - WAJIB BACA!
Karena frontend dasar sudah jadi, maka SEBELUM membuat halaman/fitur baru, Anda WAJIB:

Inspeksi Layout Dasar: Buka file src/App.vue dan src/layouts/MainLayout.vue. Pahami struktur slot untuk Header, Sidebar (jika admin), dan Footer.

Ekstrak Komponen UI Dasar: Catat semua komponen yang sudah ada di src/components/ui/ (misal: BaseButton.vue, BaseCard.vue, BaseBadge.vue, BaseInput.vue).

Kunci Pembuatan Halaman Baru:

Setiap halaman baru WAJIB membungkus kontennya dengan <MainLayout>.

DILARANG membuat ulang style kaca (glassmorphism) dari nol. Gunakan class bawaan dari layout dasar (.glass-card, .glass-panel).

Jika ada elemen baru yang belum ada di UI Kit, buat komponen baru di folder ui/ lalu re-use di halaman lain. Jangan menulis style inline secara sembarangan.

📋 1. DAFTAR FITUR LENGKAP (PER MODUL)
Berikut adalah 230 skenario yang diringkas menjadi modul-modul fungsional yang harus Anda kerjakan. Ikuti urutan ini.

MODUL A: Autentikasi & Manajemen Pengguna (Prioritas 1)
Halaman Login (/login): Form email + password. Tombol "Login" berukuran 48px. Ada toggle "Ingat Saya". Redirect otomatis ke Dashboard sesuai role (Buyer/Admin).

Halaman Register (/register): Form multi-step (Data Perusahaan, Negara, PIC, Nomor Telepon, Password). Validasi real-time.

Lupa Password (/forgot-password): Input email, kirim link reset via Nodemailer.

Fitur Multi-Bahasa (i18n): Tersedia 4 bahasa (EN/ID/ZH/FR). Simpan preferensi bahasa di localStorage (bukan di cookie). Perbaiki error fr.json yang tidak terbaca.

Logout: Hapus session (JWT via cookie) dan redirect ke login.

MODUL B: Dashboard & RFQ (Request for Quotation) - Buyer (Prioritas 2)
Dashboard Buyer (/buyer/dashboard):

3 Stat Cards: Total Volume Aktif, Pending Responses, Jumlah Supplier Dihubungi.

Daftar Request (Cards): Menampilkan list RFQ yang sudah diajukan. Setiap card menampilkan Nama Produk, Badge Kategori, Jumlah, Estimasi Harga (jika sudah di-quote), dan Status Badge (Warna: Amber/Blue/Indigo/Emerald).

Buat RFQ Baru (/buyer/rfq/create): Form Wizard (Step 1: Nama Produk & Kategori, Step 2: Spesifikasi Teknis, Step 3: Jumlah & Budget, Step 4: Upload Gambar Referensi). Simpan ke database.

Detail Request (Trust Engine) (/buyer/rfq/:id):

Tampilkan Spesifikasi & Gambar.

Supplier Card (muncul setelah di-quote): Nama Pabrik, Badge "Verified Factory", Lokasi, Harga/Unit.

Tombol Aksi: "Accept Quotation" (muncul jika status = 'quoted').

Visual Timeline 5 Langkah: Received → Quote Approved → Production & QC → Shipped → Arrived. Progress bar otomatis terisi.

MODUL C: Proses Produksi & QC (Buyer & Admin) - Prioritas 3
Monitoring Produksi (Buyer): Melihat foto/video QC yang diunggah Admin di halaman Detail Request. Progress bar berubah sesuai slider Admin.

Upload QC (Admin): Admin bisa upload multiple gambar/foto di modal update. Gambar disimpan di folder backend/uploads dengan izin 755.

Slider Progres (Admin): Slider 0-100% untuk menentukan seberapa jauh produksi. Status otomatis berubah ke "Production" jika slider > 0.

MODUL D: Terminal Admin & Operasional - Prioritas 4
Dashboard Admin (/admin/dashboard):

4 Metrik Utama: Total Permintaan, Prioritas Tinggi, Sedang Diproses, Tingkat Keberhasilan (pakai Chart.js).

Tabel Manajemen Permintaan (/admin/requests):

Tabel densitas tinggi: Buyer Entity, Kategori, Tanggal Request, Estimasi Volume, Status, Actions (tombol "Update").

Fitur Filter berdasarkan Status dan Kategori.

Modal Update Status (Komponen Kritis):

Dropdown Status: Ubah status (Pending → Quoted → Production → Shipped → Arrived).

Pencarian/Nama Supplier: Input teks untuk menetapkan supplier.

Input Harga: Nominal dalam USD.

Upload Media QC: Multiple file upload.

Slider Progres: 0 - 100%.

Internal Notes: Textarea khusus untuk catatan rahasia tim (tidak terlihat pembeli).

MODUL E: Integrasi & Lintas Fungsi - Prioritas 5
Chat Real-time: Integrasi widget Tawk.to (perbaiki ID dummy di index.html).

Notifikasi Email: Kirim notifikasi ke pembeli saat penawaran tiba (menggunakan Nodemailer, perbaiki .env agar password tidak hardcode).

Sistem Rating: Buyer bisa memberi rating 1-5 bintang untuk supplier setelah barang tiba.

🗂️ 2. STRUKTUR FOLDER & FILE WAJIB (Vue 3)
Susun folder frontend/src/ seperti ini. Ini adalah kunci. Semua halaman baru harus mengikuti pola ini:

text
src/
├── assets/
│   └── main.css (berisi konfigurasi glassmorphism global)
├── components/
│   ├── ui/               # KOMPONEN DASAR (RE-USE) - JANGAN DIUBAH SEMBARANGAN
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue   # (Kartu kaca dengan bg-white/70 backdrop-blur)
│   │   ├── BaseBadge.vue  # (Status: Pending, Production, dll)
│   │   ├── BaseInput.vue
│   │   └── BaseModal.vue  # Modal untuk Admin Update
│   ├── layout/
│   │   └── MainLayout.vue # <-- INI KUNCI! (Header, Sidebar, Footer, Slot)
│   ├── buyer/
│   │   ├── RFQForm.vue    # Komponen Wizard
│   │   └── Timeline.vue   # Komponen 5 Langkah
│   └── admin/
│       ├── DataTable.vue
│       └── UpdateModalContent.vue
├── views/                 # HALAMAN UTAMA (Setiap file = 1 route)
│   ├── auth/
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── buyer/
│   │   ├── Dashboard.vue     # WAJIB pakai MainLayout
│   │   ├── RFQCreate.vue     # WAJIB pakai MainLayout
│   │   └── RequestDetail.vue # WAJIB pakai MainLayout
│   └── admin/
│       ├── Dashboard.vue     # WAJIB pakai MainLayout + Sidebar khusus
│       └── RequestManage.vue # WAJIB pakai MainLayout + Sidebar
├── locales/               # File i18n (EN, ID, ZH, FR)
├── router/
│   └── index.js           # Definisikan semua route di sini
├── stores/                # Pinia (State Management) untuk user, notifikasi
└── services/
    ├── api.js             # Axios instance (baseURL otomatis)
    └── auth.js            # Fungsi login/logout (pindah dari localStorage ke cookie)
📝 3. FORMAT WAJIB LAPORAN progres.md
Buat file progres.md di root project. Setiap kali Anda menambahkan 1 fitur atau memperbaiki 1 bug, WAJIB menambahkan baris baru di file ini. Formatnya harus konsisten:

markdown
# Log Pengembangan AfriChina Bridge

> **Aturan:** Update setiap kali ada perubahan kode (minimal 1 kali per hari). Gunakan format di bawah.

---

## 📅 [Tanggal] - [Nama Developer]

### ✅ FITUR/PENGERJAAN
- **[Modul]** Nama fitur yang dikerjakan.
  - Detail aktivitas 1 (misal: Membuat komponen BaseButton dengan varian warna).
  - Detail aktivitas 2 (misal: Mengintegrasikan API Login ke backend).

### 🐛 PERBAIKAN (BUG FIX)
- **[ID Issue/Deskripsi]** Penjelasan singkat perbaikan.
  - Root cause: ...
  - Solusi: ...

### 📂 FILE YANG DIUBAH
- `src/views/auth/Login.vue` (Menambahkan validasi email)
- `backend/server.js` (Memperbaiki CORS)

### 🚧 BLOCKER / KENDALA
- Belum bisa testing upload file karena izin folder.

### ✅ STATUS HARI INI
- [ ] Selesai (tandai dengan x jika sudah)

---
Contoh pengisian pertama (setelah QA Fix):

markdown
## 📅 16 Juli 2026 - Tim Developer

### ✅ FITUR/PENGERJAAN
- **[Infrastruktur]** Perbaikan Blocker QA (CORS & Binding).
  - Mengubah server.js menggunkan origin dinamis (regex) dan binding ke 0.0.0.0.
  - Menambahkan file .env.example untuk backend (menghapus password hardcoded).

### 🐛 PERBAIKAN (BUG FIX)
- **[#151 CORS]** Mengganti array statis dengan fungsi origin callback.
- **[#164 Binding]** Menambahkan '0.0.0.0' pada app.listen.

### 📂 FILE YANG DIUBAH
- `backend/server.js`
- `frontend/src/main.js` (Menambahkan import fr.json)

### 🚧 BLOCKER / KENDALA
- Belum install cookie-parser untuk migrasi JWT dari localStorage ke cookie.

### ✅ STATUS HARI INI
- [x] Selesai
🗺️ 4. ROADMAP PENGERJAAN (URUTAN PRIORITAS)
Jangan terburu-buru. Ikuti fase ini:

Fase 0 (Selesai dalam 1 Hari) - Infrastructure Fix: Terapkan semua perbaikan dari QA Report (CORS, Binding, i18n, Env, Cookie Parser). Pastikan npm run dev bisa diakses dari HP.

Fase 1 (Hari 2-3) - Autentikasi: Selesaikan Login, Register, dan Middleware JWT. Buat halaman dashboard kosong untuk Buyer dan Admin (hanya statis).

Fase 2 (Hari 4-5) - Alur Buyer: Buat form RFQ, halaman daftar request, dan halaman detail (timeline).

Fase 3 (Hari 6-7) - Alur Admin: Buat tabel manajemen request dan Modal Update Status (lengkap dengan upload gambar dan slider).

Fase 4 (Hari 8) - Integrasi & Polish: Pasang Tawk.to, testing notifikasi email, dan perbaiki responsivitas mobile.

🚨 5. PENGINGAT KRUSIAL UNTUK DEVELOPER
Responsivitas Mobile (WAJIB): Semua halaman harus ramai di HP. Gunakan class sm: md: lg: di Tailwind. Ingat aturan tinggi tombol minimal 48px (class min-h-[48px]).

Jangan Hardcode Teks: Semua tulisan (label, judul, tombol) WAJIB menggunakan $t('key') dari i18n. Jangan menulis "Login" langsung di HTML.

Keamanan Token: JANGAN simpan JWT di localStorage. Gunakan HttpOnly Cookie seperti yang sudah diarahkan di QA Report.

Gunakan BaseLayout: Buka file MainLayout.vue. Apapun halaman baru yang Anda buat, copy-paste struktur template dari halaman yang sudah ada (misal Dashboard Buyer) ke halaman baru. Pastikan slot #content terisi.


5.1. Konfigurasi CORS untuk Domain Cloudflare
Backend hanya akan menerima request dari domain yang sudah terdaftar di Cloudflare (misal https://africhinabridge.com).

Di server.js, tambahkan domain tersebut ke dalam array/regex CORS.

Binding 0.0.0.0 tetap karena container Docker akan mengekspos port ke host.

5.2. Environment Variables di Docker
Jangan hardcode apapun di server.js atau main.js. Semua konfigurasi (PORT, DB_URL, JWT_SECRET, BASE_URL) harus berasal dari process.env.

Buat file .env untuk development, dan overwrite dengan environment variables saat menjalankan container Docker (via docker run -e atau docker-compose.yml).

5.3. Cloudflare Tunnel (Tanpa IP Publik)
Install cloudflared di server/host.

Jalankan tunnel: cloudflared tunnel --url http://localhost:5173 untuk frontend, dan http://localhost:5000 untuk backend (atau gunakan satu tunnel yang diarahkan ke reverse proxy seperti Nginx).

Pastikan backend menerima request dari https://*.trycloudflare.com atau domain kustom Anda. Tambahkan origin tersebut ke CORS.

5.4. Penggunaan Cookie dengan HTTPS (Wajib)
Karena Cloudflare menyediakan HTTPS, Anda harus mengatur secure: true pada cookie JWT.

Di authController, set cookie dengan:

javascript
res.cookie('token', token, {
  httpOnly: true,
  secure: true,   // karena HTTPS via Cloudflare
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
5.5. Dockerfile & docker-compose.yml

🎯 KESIMPULAN
Blueprint ini adalah "Kitab Suci" pengembangan.

Sebelum coding, cek progres.md untuk melihat siapa mengerjakan apa.

Saat coding, patuhi struktur folder dan re-use komponen UI yang sudah ada di components/ui/.

Setelah coding, update progres.md dengan format di atas.