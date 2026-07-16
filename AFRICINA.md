AfriChina Bridge adalah platform B2B demand-driven kelas premium yang berfungsi sebagai jembatan digital terverifikasi antara importir di Afrika (Nigeria, Kenya, Ethiopia, Ghana, dll.) dan pemasok/manufaktur di China.
Platform ini tidak sekadar "marketplace" biasa, melainkan sebuah Sistem Manajemen Rantai Pasok (Supply Chain Management) yang dipandu oleh tim internal (Admin). Platform ini dirancang untuk menghilangkan friksi dalam perdagangan lintas benua, seperti ketidakpercayaan, hambatan bahasa, dan kurangnya transparansi logistik, dengan menyediakan alur kerja yang terstruktur, terverifikasi, dan transparan dari awal permintaan hingga barang tiba.
🎯 1. CORE VALUE PROPOSITION (Nilai Utama)
Trust & Verification (Kepercayaan): Menghilangkan ketakutan akan penipuan dengan menampilkan badge "Verified Factory", data pabrik yang jelas, dan bukti QC (Quality Control) berupa foto/video langsung dari lantai produksi.
End-to-End Transparency (Transparansi Penuh): Timeline visual 5-langkah yang memungkinkan pembeli melacak status pesanan mereka secara real-time, didukung oleh Internal Notes rahasia untuk tim operasional.
Frictionless Communication (Komunikasi Tanpa Hambatan): Integrasi chat (Tawk.to) dan sistem quoting terpusat yang menjembatani kesenjangan bahasa dan budaya antara pembeli Afrika dan pabrik China.
👥 2. USER ROLES & CORE WORKFLOWS
A. Buyer (Importir Afrika)
Fokus: Kemudahan penggunaan, kejelasan informasi, dan rasa aman.
Onboarding: Registrasi dengan data perusahaan dan negara.
Pengajuan Kebutuhan (RFQ): Mengisi formulir detail (Nama Produk, Kategori, Spesifikasi Teknis, Jumlah, Anggaran, dan Upload Gambar Referensi).
Review & Persetujuan: Menerima notifikasi saat penawaran (Quote) tiba, melihat detail harga dan profil supplier, lalu menekan tombol "Accept Quotation".
Monitoring Produksi: Melihat Progress Bar (0-100%) dan galeri foto QC yang diunggah oleh Admin saat status berada di tahap "Production".
Penerimaan & Rating: Mengonfirmasi barang tiba dan memberikan rating (1-5 bintang) kepada supplier.
B. Admin / Chief Operations (Tim Internal Anda)
Fokus: Efisiensi data, kontrol penuh, dan manajemen risiko.
Dashboard Analitik: Memantau kesehatan bisnis melalui 4 metrik utama: Total Permintaan, Prioritas Tinggi, Sedang Diproses, dan Tingkat Keberhasilan.
Manajemen Permintaan: Melihat tabel data lengkap, memfilter berdasarkan status/kategori, dan membuka Modal Update Status.
Eksekusi Sourcing: Mencari supplier yang cocok, memasukkan harga penawaran, dan menetapkan supplier ke permintaan tertentu.
Manajemen Produksi & QC: Mengubah status ke "Production", mengunggah bukti foto/video, dan mengatur persentase progres.
Internal Notes: Menulis catatan rahasia (misal: "Supplier sedang peak season, estimasi telat 3 hari") yang tersembunyi dari tampilan pembeli.
🖥️ 3. KEY FEATURES & UI MODULES (Berdasarkan HTML Snippets)
Authentication Hub: Halaman Login/Register yang bersih, terpusat, dengan dukungan multi-language (EN/ID/ZH) dan validasi form yang ketat.
Buyer Dashboard:
Stat Cards: Menampilkan "Total Active Volume", "Pending Responses", dan "Suppliers Contacted".
Request List: Daftar kartu (cards) yang menampilkan Nama Produk, Badge Kategori, Tanggal, Jumlah, Harga (jika ada), dan Status Badge yang berwarna-warni.
Request Details (The Trust Engine):
Menampilkan Spesifikasi Teknis dan Gambar Referensi.
Supplier Card: Muncul hanya setelah di-quote, menampilkan Nama Perusahaan, Badge "Verified Factory", Lokasi, dan Estimasi Harga per Unit.
Action Area: Tombol besar "Accept Quotation" (hanya muncul jika status = quoted).
Timeline Visual: 5 langkah vertikal (Received → Quote Approved → Production & QC → Shipped → Arrived) dengan indikator progres yang jelas.
Admin Terminal:
Tabel data berdensitas tinggi dengan kolom: Buyer Entity, Category, Request Date, Est. Volume, Status, dan Actions.
Update Modal: Form komprehensif untuk mengubah status, menetapkan supplier, input harga, upload media QC, slider progres (0-100%), dan textarea Internal Notes.
🎨 4. DESIGN SYSTEM & UX PHILOSOPHY
Berdasarkan DESIGN.md, platform ini mengadopsi estetika "Modern Corporate meets 3D Glassmorphism". Tujuannya adalah memancarkan kesan Visionary, Prestigious, dan Multi-Dimensional.
A. Color Palette (Warna & Psikologi)
Background: #f7f9fb (Slate-50). Mengurangi kelelahan mata selama penggunaan berjam-jam.
Primary Action: #3525cd hingga #4f378a (Deep Indigo/Purple Gradient). Melambangkan stabilitas, kepercayaan institusional, dan kecanggihan teknologi.
Status Indicators (Fungsional):
Pending: Amber (#f59e0b) – Memerlukan perhatian.
Processing/Production: Blue (#3b82f6) – Alur kerja aktif.
Quoted: Indigo (#3525cd) – Milestone finansial.
Completed: Emerald (#10b981) – Finalisasi yang sukses.
B. Typography (Tipografi)
Font: Inter (Eksklusif). Utilitarian, sistematis, dan sangat mudah dibaca.
Hierarchy: Headline menggunakan font-weight 700-800 dengan letter-spacing negatif tipis untuk memberikan efek "mengangkat" teks dari permukaan kaca. Body text menggunakan line-height 1.6 untuk keterbacaan maksimal di latar belakang yang blurred.
C. Elevation & Depth (Kedalaman 3D)
Hierarki visual dibangun melalui Extreme Multi-Layering:
Level 0 (Background): Permukaan datar Slate-50.
Level 1 (Glass Layer): Kartu dengan bg-white/70, backdrop-blur-xl, dan yang paling penting: border-t border-white/50 untuk mensimulasikan specular highlight (pantulan cahaya) di tepi atas kaca.
Level 2 (Floating Elements): Menggunakan deep shadow (shadow-[0_20px_50px_rgba(79,70,229,0.15)]). Saat di-hover, elemen akan bergerak naik -8px pada sumbu Y untuk mensimulasikan pengangkatan fisik.
Inputs: Menggunakan inner shadow (inset 0 2px 4px rgba(0,0,0,0.06)) agar terlihat tenggelam (recessed) ke dalam permukaan kaca, memberikan umpan balik taktil.
D. Accessibility (WCAG AA)
Semua tombol dan area klik memiliki tinggi minimum 48px (h-12) untuk target sentuh mobile yang optimal.
Kontras warna teks terhadap latar belakang kaca dijamin memenuhi rasio 4.5:1.
State focus menggunakan ring-4 dengan warna primary yang transparan untuk navigasi keyboard yang jelas.
⚙️ 5. TECHNICAL ARCHITECTURE (Ringkasan)
Frontend: Vue 3 (Composition API + <script setup>), Vite, Tailwind CSS v3, Vue Router, Axios, vue-i18n (untuk EN/ID/ZH), Chart.js (untuk dashboard admin).
Backend: Node.js + Express.js (RESTful API).
Database: PostgreSQL (Relational, mendukung UUID, JSONB untuk array gambar, dan relasi yang ketat).
Keamanan: JWT (JSON Web Tokens) + bcrypt untuk hashing password. Middleware untuk memisahkan akses buyer dan admin.
Eksternal: Tawk.to (Widget chat gratis), Nodemailer (untuk notifikasi email ke supplier).
🚀 6. STRATEGIC IMPACT (Dampak Bisnis)
Dengan menerapkan sistem ini, AfriChina Bridge tidak hanya mendigitalkan proses, tetapi memstandarisasi kepercayaan.
Bagi Pembeli: Mengubah persepsi "membeli dari China itu berisiko" menjadi "membeli dari China melalui AfriChina Bridge itu aman dan terpantau".
Bagi Tim Internal: Mengubah operasi yang biasanya berantakan (via WhatsApp/Email terpisah) menjadi satu Single Source of Truth yang terdata, terukur, dan dapat diaudit.
