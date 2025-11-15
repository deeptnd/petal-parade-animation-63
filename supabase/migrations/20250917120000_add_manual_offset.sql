-- Ensure app_settings table exists
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY,
  window_start TEXT NULL,
  window_end TEXT NULL,
  start_time TEXT NULL,
  end_time TEXT NULL,
  enforce_window BOOLEAN NULL,
  user_enabled BOOLEAN NULL,
  manual_offset INTEGER NOT NULL DEFAULT 0
);

-- Add manual_offset column if table existed already without it
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS manual_offset INTEGER NOT NULL DEFAULT 0;

-- Ensure a single global row exists so upserts/read work seamlessly
INSERT INTO public.app_settings (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS if desired (commented out if not used elsewhere)
-- ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

