-- Create the flower_entries table
CREATE TABLE IF NOT EXISTS flower_entries (
    id BIGSERIAL PRIMARY KEY,
    roll_number TEXT NOT NULL,
    selected_petals TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_flower_entries_created_at ON flower_entries(created_at DESC);

-- Create an index on roll_number for searching
CREATE INDEX IF NOT EXISTS idx_flower_entries_roll_number ON flower_entries(roll_number);

-- Enable Row Level Security (RLS)
ALTER TABLE flower_entries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read and insert
CREATE POLICY "Allow public access" ON flower_entries
    FOR ALL USING (true) WITH CHECK (true);

-- Global application settings table for cross-device configuration
CREATE TABLE IF NOT EXISTS app_settings (
    id text PRIMARY KEY,
    window_start text NULL, -- legacy
    window_end text NULL,   -- legacy
    start_time text NULL,   -- HH:MM 24h local time
    end_time text NULL,     -- HH:MM 24h local time
    enforce_window boolean DEFAULT true,
    user_enabled boolean DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: allow public read, restrict writes to all (adjust if you need auth)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read app_settings" ON app_settings
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public upsert app_settings" ON app_settings
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public update app_settings" ON app_settings
    FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ensure a singleton row exists
INSERT INTO app_settings (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;