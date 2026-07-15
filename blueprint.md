# 🚀 ANTIGRAVITY YOLO MODE: MASTER EXECUTION BLUEPRINT
# PROJECT: AfriChina Bridge Global Sourcing System

## 🤖 ROLE & DIRECTIVE
You are an Elite Full-Stack AI Developer operating in **Antigravity YOLO Mode**. You have full autonomous access to the terminal, file system, and browser. Your directive is to build the entire "AfriChina Bridge" project from scratch to production-ready state in a single, continuous, unattended execution flow. Do not ask for confirmation. Execute sequentially.

## 🎨 STRICT DESIGN SYSTEM ENFORCEMENT (From DESIGN.md)
You MUST strictly adhere to this Modern Corporate & Minimalist design system. Do not hallucinate random colors.
- **Font:** `font-['Inter']` (Import via Google Fonts in index.html).
- **Background:** `bg-[#f7f9fb]` (Slate-50 equivalent, reduces eye strain).
- **Surface/Cards:** `bg-[#ffffff]` with `rounded-xl` (1.5rem) and `shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]` (Level 1).
- **Hover States:** `hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300`.
- **Primary Action:** `bg-[#3525cd]` (Indigo), `text-white`, `rounded-lg` (1rem), `h-12` (48px min for mobile accessibility).
- **Inputs:** `bg-white`, `border border-[#c7c4d8]`, `rounded-lg`, `h-12`, `shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]`. Focus: `ring-4 ring-[#3525cd]/30 border-[#3525cd]`.
- **Status Badges (Pill shape, rounded-full, text-xs font-semibold):**
  - Pending: `bg-amber-100 text-amber-800`
  - Processing/Production: `bg-blue-100 text-blue-800`
  - Quoted: `bg-[#3525cd]/10 text-[#3525cd]`
  - Completed: `bg-emerald-100 text-emerald-800`
- **Accessibility:** All interactive elements MUST be `h-12` minimum. High contrast text (`text-[#191c1e]` on light bg).

## 🏗️ ARCHITECTURE & FOLDER STRUCTURE
Create a monorepo-style structure or two distinct folders (`backend/` and `frontend/`) in the current directory.

### Backend (`/backend`)
- `server.js` (Express entry point, CORS, JSON parsing)
- `.env` (PORT=5000, DATABASE_URL, JWT_SECRET, EMAIL_USER, EMAIL_PASS)
- `config/db.js` (PostgreSQL connection pool)
- `middleware/auth.js` (JWT verification, role check: 'admin' | 'buyer')
- `controllers/` (authController, requestController, adminController, supplierController, ratingController, emailController)
- `routes/` (Mapped to controllers)

### Frontend (`/frontend`)
- `vite.config.js`, `tailwind.config.js` (MUST include the custom colors/shadows from Design System above), `postcss.config.js`
- `src/main.js` (Vue app, Router, i18n, Axios setup)
- `src/App.vue` (Router view + Tawk.to script injection)
- `src/api/axios.js` (BaseURL, JWT interceptor, error handling)
- `src/locales/` (en.json, id.json, zh.json)
- `src/components/` (Navbar.vue, StatusBadge.vue, ProgressBar.vue, Timeline.vue, LanguageSwitcher.vue)
- `src/pages/` (Login.vue, Register.vue, Dashboard.vue, NewRequest.vue, RequestDetail.vue, AdminDashboard.vue, AdminRequests.vue, AdminSuppliers.vue)

## 🗄️ DATABASE SCHEMA (PostgreSQL)
Execute this SQL schema to initialize the database. Ensure all tables are created.
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    country VARCHAR(50),
    phone VARCHAR(20),
    company_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    contact_person VARCHAR(100),
    phone_china VARCHAR(20),
    email VARCHAR(100),
    factory_address TEXT,
    certificates TEXT,
    verification_level VARCHAR(20) DEFAULT 'Dokumen',
    avg_rating DECIMAL(3,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    specifications TEXT,
    quantity INT,
    budget_range VARCHAR(50),
    image_urls TEXT[],
    status VARCHAR(50) DEFAULT 'pending',
    assigned_supplier_id UUID REFERENCES suppliers(id),
    quoted_price DECIMAL(15,2),
    quote_accepted_at TIMESTAMP,
    production_progress INT DEFAULT 0,
    production_media TEXT[],
    estimated_arrival_date DATE,
    internal_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tracking_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    buyer_id UUID REFERENCES users(id),
    score INT CHECK (score >= 1 AND score <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    receiver_email VARCHAR(100),
    subject TEXT,
    body TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

🔄 STATE MACHINE (Strict Validation)
pending → quoted: Admin MUST provide assigned_supplier_id and quoted_price.
quoted → approved: Triggered by Buyer clicking "Accept Quote" (sets quote_accepted_at).
approved → production: Admin action.
production → shipped: Admin MUST provide at least 1 URL in production_media and update production_progress to 100.
shipped → arrived → completed: Sequential admin actions.
📡 API ENDPOINTS (Implement All)
Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
Buyer Requests: GET /api/requests, POST /api/requests (handle multipart/form-data for images), GET /api/requests/:id, PUT /api/requests/:id/accept
Admin: GET /api/admin/requests, PUT /api/admin/requests/:id (update status, price, internal_notes, progress, media), GET /api/admin/statistics (return data for 4 charts), GET /api/admin/suppliers, POST /api/admin/suppliers
Extras: POST /api/admin/requests/:id/email (Nodemailer), POST /api/ratings
🖥️ FRONTEND PAGE SPECIFICATIONS
Auth: Centered glassmorphic cards. Link between Login/Register.
Buyer Dashboard: 3 Stats cards (Total Volume, Pending, Suppliers). List of requests with StatusBadge. Floating Action Button (FAB) for "New Request".
New Request: Form with Product Name, Category (dropdown), Specs (textarea), Qty, Budget, and Image Upload (max 3, with preview). Sticky submit button.
Request Detail:
Header with Product & StatusBadge.
Supplier Card (shows ONLY if status >= 'quoted').
Action: Large "Accept Quotation" button (ONLY if status === 'quoted').
Timeline component (5 steps).
If status === 'production', show ProgressBar component and grid of production_media images.
If status === 'completed', show Rating form (5 stars + textarea).
Admin Dashboard: 4 Chart.js widgets (Total Value, Avg Response Time, Category Bar, Status Pie).
Admin Requests: Data table with filters. Clicking a row opens AdminRequestModal.vue.
Admin Request Modal: Dropdowns for Status & Supplier, Price input, internal_notes textarea (labeled "⚠️ Hidden from Buyer"), QC image upload input, and Progress slider (0-100). "Send Email to Supplier" button opening a pre-filled Nodemailer template.
Shared: Navbar with LanguageSwitcher (EN/ID/ZH) and profile dropdown. Tawk.to widget embedded in index.html.
⚙️ YOLO EXECUTION SEQUENCE (DO NOT DEVIATE)
Phase 1: Backend Foundation
Initialize backend/, run npm init -y, install express, pg, dotenv, cors, bcrypt, jsonwebtoken, multer, nodemailer.
Create .env template.
Write db.js and execute the SQL schema creation.
Build all controllers and routes. Ensure JWT middleware protects admin routes.
Phase 2: Frontend Foundation
5. Initialize frontend/ with Vite + Vue. Install vue-router, axios, tailwindcss, postcss, autoprefixer, vue-i18n, chart.js, vue-chartjs.
6. Configure tailwind.config.js with the EXACT custom colors, shadows, and border-radius from the Design System section above.
7. Setup axios.js with JWT interceptor (read from localStorage).
8. Setup vue-i18n with basic EN/ID/ZH JSON files.
Phase 3: Component & Page Generation
9. Generate all shared components (Navbar, StatusBadge, ProgressBar, Timeline, LanguageSwitcher).
10. Generate Auth pages.
11. Generate Buyer pages, connecting forms to Axios endpoints. Implement image preview logic.
12. Generate Admin pages. Integrate Chart.js in AdminDashboard. Build the complex AdminRequestModal with all state update logic.
Phase 4: Polish & Deployment Prep
13. Inject Tawk.to script into frontend/index.html.
14. Run npm run build in frontend to verify no build errors.
15. Generate a DEPLOYMENT.md file containing the exact Nginx reverse proxy config and PM2 commands for the VPS.


## 📋 PHASE 5: PROGRESS TRACKING & FINAL AUDIT (MANDATORY - DO NOT SKIP)

### 🎯 DIRECTIVE
After completing Phases 1-4, you MUST generate a single comprehensive progress file named `PROGRESS.md` in the **root directory** (`/PROGRESS.md`). This file serves as the single source of truth for what has been executed, what is pending, and what needs human intervention.

### 📝 FILE REQUIREMENTS
Create `/PROGRESS.md` with the following EXACT structure:

```markdown
# 📊 AfriChina Bridge - Execution Progress Report
**Generated:** [YYYY-MM-DD HH:MM UTC]
**Execution Mode:** Antigravity YOLO Mode
**Status:** [✅ COMPLETED / ⚠️ PARTIAL / ❌ FAILED]

---

## 🏁 EXECUTIVE SUMMARY
- **Total Tasks:** [X]
- **Completed:** [X] ✅
- **In Progress:** [X] 🔄
- **Pending/Failed:** [X] ⏳
- **Completion Rate:** [X]%

---

## 🟢 PHASE 1: BACKEND FOUNDATION
| # | Task | Status | File Path | Notes |
|---|------|--------|-----------|-------|
| 1.1 | Initialize backend/ with npm init | ✅/⏳ | /backend/package.json | |
| 1.2 | Install dependencies (express, pg, dotenv, cors, bcrypt, jsonwebtoken, multer, nodemailer) | ✅/⏳ | /backend/package.json | List versions |
| 1.3 | Create .env template | ✅/⏳ | /backend/.env | |
| 1.4 | Create db.js PostgreSQL connection | ✅/⏳ | /backend/config/db.js | |
| 1.5 | Execute SQL schema (6 tables + uuid-ossp) | ✅/⏳ | /backend/init.sql | Confirm table count |
| 1.6 | Build authController + routes | ✅/⏳ | /backend/controllers/authController.js, /backend/routes/auth.js | |
| 1.7 | Build requestController + routes (multipart) | ✅/⏳ | /backend/controllers/requestController.js | Multer config |
| 1.8 | Build adminController + routes (JWT protected) | ✅/⏳ | /backend/controllers/adminController.js | |
| 1.9 | Build supplierController + routes | ✅/⏳ | /backend/controllers/supplierController.js | |
| 1.10 | Build ratingController + routes | ✅/⏳ | /backend/controllers/ratingController.js | |
| 1.11 | Build emailController (Nodemailer) | ✅/⏳ | /backend/controllers/emailController.js | |
| 1.12 | Create auth middleware (JWT + role check) | ✅/⏳ | /backend/middleware/auth.js | |
| 1.13 | Create server.js entry point (CORS, JSON) | ✅/⏳ | /backend/server.js | |

## 🟢 PHASE 2: FRONTEND FOUNDATION
| # | Task | Status | File Path | Notes |
|---|------|--------|-----------|-------|
| 2.1 | Initialize Vite + Vue project | ✅/⏳ | /frontend/ | |
| 2.2 | Install deps (vue-router, axios, tailwindcss, postcss, autoprefixer, vue-i18n, chart.js, vue-chartjs) | ✅/⏳ | /frontend/package.json | |
| 2.3 | Configure tailwind.config.js with EXACT design tokens | ✅/⏳ | /frontend/tailwind.config.js | Verify #3525cd, #f7f9fb, shadows |
| 2.4 | Setup axios.js with JWT interceptor | ✅/⏳ | /frontend/src/api/axios.js | |
| 2.5 | Setup vue-i18n (en.json, id.json, zh.json) | ✅/⏳ | /frontend/src/locales/ | |
| 2.6 | Configure main.js (Router, i18n, Axios) | ✅/⏳ | /frontend/src/main.js | |

## 🟢 PHASE 3: COMPONENTS & PAGES
| # | Task | Status | File Path | Notes |
|---|------|--------|-----------|-------|
| 3.1 | Navbar.vue (with profile dropdown) | ✅/⏳ | /frontend/src/components/Navbar.vue | |
| 3.2 | StatusBadge.vue (4 variants per design system) | ✅/⏳ | /frontend/src/components/StatusBadge.vue | |
| 3.3 | ProgressBar.vue | ✅/⏳ | /frontend/src/components/ProgressBar.vue | |
| 3.4 | Timeline.vue (5 steps) | ✅/⏳ | /frontend/src/components/Timeline.vue | |
| 3.5 | LanguageSwitcher.vue (EN/ID/ZH) | ✅/⏳ | /frontend/src/components/LanguageSwitcher.vue | |
| 3.6 | Login.vue (glassmorphic) | ✅/⏳ | /frontend/src/pages/Login.vue | |
| 3.7 | Register.vue | ✅/⏳ | /frontend/src/pages/Register.vue | |
| 3.8 | Dashboard.vue (3 stat cards + request list + FAB) | ✅/⏳ | /frontend/src/pages/Dashboard.vue | |
| 3.9 | NewRequest.vue (image upload, preview, sticky submit) | ✅/⏳ | /frontend/src/pages/NewRequest.vue | Max 3 images |
| 3.10 | RequestDetail.vue (supplier card, accept button, timeline, media grid, rating form) | ✅/⏳ | /frontend/src/pages/RequestDetail.vue | Conditional rendering |
| 3.11 | AdminDashboard.vue (4 Chart.js widgets) | ✅/⏳ | /frontend/src/pages/AdminDashboard.vue | |
| 3.12 | AdminRequests.vue (data table + filters) | ✅/⏳ | /frontend/src/pages/AdminRequests.vue | |
| 3.13 | AdminSuppliers.vue | ✅/⏳ | /frontend/src/pages/AdminSuppliers.vue | |
| 3.14 | AdminRequestModal.vue (status, supplier, price, notes, QC upload, progress slider, email button) | ✅/⏳ | /frontend/src/components/AdminRequestModal.vue | Complex state logic |

## 🟢 PHASE 4: POLISH & DEPLOYMENT
| # | Task | Status | File Path | Notes |
|---|------|--------|-----------|-------|
| 4.1 | Inject Tawk.to script into index.html | ✅/⏳ | /frontend/index.html | |
| 4.2 | Run `npm run build` - zero errors | ✅/⏳ | /frontend/dist/ | Paste build log |
| 4.3 | Generate DEPLOYMENT.md (Nginx + PM2) | ✅/⏳ | /DEPLOYMENT.md | |

## 🟢 PHASE 5: PROGRESS TRACKING
| # | Task | Status | File Path | Notes |
|---|------|--------|-----------|-------|
| 5.1 | Generate this PROGRESS.md file | ✅ | /PROGRESS.md | You are here |

---

## 📂 FILES CREATED (Full Tree)