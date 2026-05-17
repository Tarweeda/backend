-- ============================================================
-- 005_event_media.sql
-- Adds cover image and recap fields to supper_events
-- ============================================================

ALTER TABLE supper_events
  ADD COLUMN IF NOT EXISTS cover_image_path VARCHAR(300),
  ADD COLUMN IF NOT EXISTS recap TEXT;
