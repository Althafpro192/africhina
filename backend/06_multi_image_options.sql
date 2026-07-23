ALTER TABLE request_options
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
