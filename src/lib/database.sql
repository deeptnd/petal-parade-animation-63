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