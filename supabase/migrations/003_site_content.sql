-- Tarweeda Site Content (CMS)
-- Run this in Supabase SQL Editor.
-- One row per page section; `value` holds the section's content as JSON.
-- Empty table = the site renders entirely from the code-side defaults.

CREATE TABLE IF NOT EXISTS site_content (
  key         VARCHAR(50) PRIMARY KEY,
  value       JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public read; writes go through the backend service-role key (bypasses RLS).
DROP POLICY IF EXISTS "Public read site_content" ON site_content;
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
