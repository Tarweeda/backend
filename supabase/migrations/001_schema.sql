-- Tarweeda Database Schema
-- Run this in Supabase SQL Editor

-- Products
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(100) UNIQUE NOT NULL,
  category      VARCHAR(20) NOT NULL CHECK (category IN ('staples', 'pantry')),
  name          VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,
  tagline       VARCHAR(300) NOT NULL,
  price_pence   INTEGER NOT NULL,
  unit          VARCHAR(50) NOT NULL,
  tag           VARCHAR(50) NOT NULL,
  image_path    VARCHAR(500),
  in_stock      BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supper Club Events
CREATE TABLE IF NOT EXISTS supper_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(100) UNIQUE NOT NULL,
  name          VARCHAR(300) NOT NULL,
  theme         VARCHAR(200) NOT NULL,
  event_date    DATE NOT NULL,
  event_time    TIME NOT NULL,
  location      VARCHAR(300) NOT NULL,
  total_seats   INTEGER NOT NULL DEFAULT 20,
  seats_left    INTEGER NOT NULL DEFAULT 20,
  price_pence   INTEGER NOT NULL,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  menu          JSONB NOT NULL DEFAULT '[]',
  status        VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                CHECK (status IN ('upcoming', 'sold_out', 'past', 'cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supper Club Packages
CREATE TABLE IF NOT EXISTS supper_packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(100) UNIQUE NOT NULL,
  icon          VARCHAR(10) NOT NULL,
  name          VARCHAR(200) NOT NULL,
  price_pence   INTEGER NOT NULL,
  guests        INTEGER NOT NULL,
  inclusions    TEXT NOT NULL,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  is_enquiry    BOOLEAN NOT NULL DEFAULT false,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gift Hampers
CREATE TABLE IF NOT EXISTS gift_hampers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(100) UNIQUE NOT NULL,
  name          VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,
  price_pence   INTEGER NOT NULL,
  contents      TEXT NOT NULL,
  image_path    VARCHAR(500),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  in_stock      BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hire Roles
CREATE TABLE IF NOT EXISTS hire_roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_num   VARCHAR(5) NOT NULL,
  role_name     VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,
  rate          VARCHAR(100) NOT NULL,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      VARCHAR(20) UNIQUE NOT NULL,
  customer_name     VARCHAR(200) NOT NULL,
  customer_email    VARCHAR(300) NOT NULL,
  fulfilment_type   VARCHAR(20) NOT NULL CHECK (fulfilment_type IN ('delivery', 'collection')),
  delivery_address  TEXT,
  notes             TEXT,
  subtotal_pence    INTEGER NOT NULL,
  delivery_fee_pence INTEGER NOT NULL DEFAULT 0,
  total_pence       INTEGER NOT NULL,
  stripe_payment_intent_id VARCHAR(300),
  payment_status    VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status      VARCHAR(20) NOT NULL DEFAULT 'received'
                    CHECK (order_status IN ('received', 'preparing', 'ready', 'delivered', 'collected', 'cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id),
  product_name  VARCHAR(200) NOT NULL,
  unit_price_pence INTEGER NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  line_total_pence INTEGER NOT NULL
);

-- Supper Club Bookings
CREATE TABLE IF NOT EXISTS supper_bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref       VARCHAR(20) UNIQUE NOT NULL,
  event_id          UUID NOT NULL REFERENCES supper_events(id),
  package_id        UUID NOT NULL REFERENCES supper_packages(id),
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  email             VARCHAR(300) NOT NULL,
  phone             VARCHAR(50),
  dietary           TEXT[] DEFAULT '{}',
  special_requests  TEXT,
  total_pence       INTEGER NOT NULL,
  stripe_payment_intent_id VARCHAR(300),
  payment_status    VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  booking_status    VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                    CHECK (booking_status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Catering Enquiries
CREATE TABLE IF NOT EXISTS catering_enquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code      VARCHAR(20) UNIQUE NOT NULL,
  name          VARCHAR(200) NOT NULL,
  email         VARCHAR(300) NOT NULL,
  event_type    VARCHAR(100) NOT NULL,
  guest_count   INTEGER,
  event_date    DATE,
  city          VARCHAR(100) NOT NULL DEFAULT 'London',
  dietary_notes TEXT,
  additional_notes TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'quoted', 'confirmed', 'declined')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hire Enquiries
CREATE TABLE IF NOT EXISTS hire_enquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code      VARCHAR(20) UNIQUE NOT NULL,
  name          VARCHAR(200) NOT NULL,
  email         VARCHAR(300) NOT NULL,
  event_date    DATE,
  location      VARCHAR(300),
  guest_count   INTEGER,
  staff_needed  TEXT[] DEFAULT '{}',
  notes         TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'quoted', 'confirmed', 'declined')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_events_date ON supper_events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON supper_events(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON supper_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON supper_bookings(email);

-- Seat booking function (prevents race conditions)
CREATE OR REPLACE FUNCTION book_seats(p_event_id UUID, p_seats INTEGER)
RETURNS BOOLEAN AS $$
DECLARE current_left INTEGER;
BEGIN
  SELECT seats_left INTO current_left FROM supper_events
    WHERE id = p_event_id FOR UPDATE;
  IF current_left >= p_seats THEN
    UPDATE supper_events SET seats_left = seats_left - p_seats
      WHERE id = p_event_id;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supper_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE supper_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_hampers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hire_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supper_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hire_enquiries ENABLE ROW LEVEL SECURITY;

-- Public read policies (backend uses service_role key which bypasses RLS)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read events" ON supper_events FOR SELECT USING (true);
CREATE POLICY "Public read packages" ON supper_packages FOR SELECT USING (true);
CREATE POLICY "Public read hampers" ON gift_hampers FOR SELECT USING (true);
CREATE POLICY "Public read hire_roles" ON hire_roles FOR SELECT USING (true);

-- Service role has full access (used by backend)
-- These are already handled by the service_role key
