-- If RLS is enabled and you need client-side delete, add a permissive policy.
-- WARNING: This allows public delete. Consider securing with service role in production.

DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'flower_entries' AND policyname = 'Allow public delete access';
  IF NOT FOUND THEN
    CREATE POLICY "Allow public delete access"
    ON public.flower_entries
    FOR DELETE
    USING (true);
  END IF;
END $$;

