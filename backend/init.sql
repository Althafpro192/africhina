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
