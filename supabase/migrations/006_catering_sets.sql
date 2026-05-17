-- ============================================================
-- 006_catering_sets.sql
-- Adds set selection fields to catering_enquiries
-- ============================================================

ALTER TABLE catering_enquiries
  ADD COLUMN IF NOT EXISTS selected_set VARCHAR(50),
  ADD COLUMN IF NOT EXISTS selected_items TEXT;
