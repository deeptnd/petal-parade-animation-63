-- Create a table for flower entries
CREATE TABLE public.flower_entries (
  id BIGSERIAL PRIMARY KEY,
  roll_number TEXT NOT NULL,
  selected_petals TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flower_entries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read and insert entries
-- This is appropriate for a public flower petal app where all entries should be visible
CREATE POLICY "Allow public read access" 
ON public.flower_entries 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.flower_entries 
FOR INSERT 
WITH CHECK (true);