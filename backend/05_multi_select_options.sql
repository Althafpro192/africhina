ALTER TABLE request_options ADD COLUMN is_selected BOOLEAN DEFAULT false;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS fk_selected_option;
ALTER TABLE requests DROP COLUMN IF EXISTS selected_option_id;
