-- Reset Everything
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS tracking_logs CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS request_options CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS suppliers (
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

CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    specifications TEXT,
    quantity INT,
    budget_range VARCHAR(50),
    sub_category VARCHAR(100),
    unit VARCHAR(50),
    currency VARCHAR(20),
    delivery_timeline DATE,
    shipping_terms VARCHAR(50),
    payment_terms VARCHAR(50),
    quality_requirements TEXT,
    certifications TEXT,
    image_urls TEXT[],
    status VARCHAR(50) DEFAULT 'menunggu_penawaran_admin' CHECK (status IN (
        'menunggu_penawaran_admin', 
        'menunggu_pemilihan_buyer', 
        'menunggu_kesepakatan_final', 
        'menunggu_pembayaran', 
        'menunggu_verifikasi_pembayaran', 
        'sedang_diproses', 
        'dikirim', 
        'menunggu_verifikasi_admin', 
        'selesai', 
        'batal', 
        'dispute'
    )),
    assigned_supplier_id UUID REFERENCES suppliers(id),
    quoted_price DECIMAL(15,2),
    quote_accepted_at TIMESTAMP,
    deal_finalized_at TIMESTAMP,
    payment_proof_url TEXT,
    selected_option_id UUID, -- Will be set after request_options is created
    production_progress INT DEFAULT 0,
    production_media TEXT[],
    estimated_arrival_date DATE,
    internal_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    price_min DECIMAL(15,2),
    price_max DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE requests ADD CONSTRAINT fk_selected_option FOREIGN KEY (selected_option_id) REFERENCES request_options(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracking_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    buyer_id UUID REFERENCES users(id),
    score INT CHECK (score >= 1 AND score <= 5),
    review TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    receiver_email VARCHAR(100),
    subject TEXT,
    body TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reinsert dummy data
INSERT INTO users (id, full_name, email, password_hash, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'Admin', 'admin@africhina.com', '$2b$10$8.a13q2bF00L9hZq67/D.u/c/Uu0.a6/2k78Z22O9rR43/79r/97C', 'admin'),
('22222222-2222-2222-2222-222222222222', 'Buyer One', 'buyer@test.com', '$2b$10$8.a13q2bF00L9hZq67/D.u/c/Uu0.a6/2k78Z22O9rR43/79r/97C', 'buyer');
-- (Hash is 'password123' used in testing earlier)

