-- ============================================================
-- 004_inventory.sql
-- Adds quantity tracking to products and stock movements table
-- ============================================================

-- 1. Add stock columns to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
  ADD COLUMN IF NOT EXISTS cost_price_pence INTEGER;

-- 2. Create stock_movements audit table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reference_id UUID,          -- order_id for OUT movements
  reason TEXT,                -- required for ADJUSTMENT
  created_by VARCHAR(200),    -- admin email for manual changes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stock_movements_product_id_idx ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS stock_movements_type_idx ON stock_movements(type);
CREATE INDEX IF NOT EXISTS stock_movements_created_at_idx ON stock_movements(created_at DESC);

-- 3. RLS: allow service-role (backend) full access; public read
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_stock_movements"
  ON stock_movements
  FOR ALL
  USING (true)
  WITH CHECK (true);
