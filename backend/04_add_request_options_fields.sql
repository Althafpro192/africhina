ALTER TABLE request_options
ADD COLUMN admin_reason TEXT,
ADD COLUMN target_delivery DATE,
ADD COLUMN shipping_method VARCHAR(50),
ADD COLUMN est_time_sea VARCHAR(100),
ADD COLUMN est_time_air VARCHAR(100),
ADD COLUMN is_fixed_price BOOLEAN DEFAULT FALSE;
