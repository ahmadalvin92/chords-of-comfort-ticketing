-- ====================================================================
-- CHORDS OF COMFORT TICKETING SYSTEM (LSPR COMM30-6SP)
-- SUPABASE / POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Run this script in Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================

-- 1. SEATS TABLE (300 VENUE SEATS: 225 MAIN FLOOR + 75 BALCONY)
CREATE TABLE IF NOT EXISTS public.seats (
  id TEXT PRIMARY KEY,                       -- e.g. 'MF-A-1', 'BAL-AA-9'
  label TEXT NOT NULL,                      -- e.g. 'A-1', 'AA-9'
  section TEXT NOT NULL,                    -- 'MAIN_FLOOR' | 'BALCONY'
  row TEXT NOT NULL,                        -- 'A'..'H' or 'AA'..'AC'
  number INT NOT NULL,
  block TEXT,                               -- 'LEFT' | 'CENTER' | 'RIGHT'
  category TEXT NOT NULL,                   -- 'VIP' | 'VIP_BALCONY' | 'REGULAR'
  price INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'held' | 'sold'
  held_until BIGINT,                        -- Unix timestamp ms
  held_by TEXT,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seats_status ON public.seats(status);
CREATE INDEX IF NOT EXISTS idx_seats_order_id ON public.seats(order_id);

-- 2. ORDERS TABLE (CUSTOMER ORDERS & ATTACHED TICKET PASSES)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,                       -- e.g. 'LSPR-6SP-7K9A2M'
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  notes TEXT,
  total_amount INT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'expired'
  payment_method TEXT DEFAULT 'TRANSFER_BCA',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Array of tickets with seatId, seatLabel, ticketCode, isCheckedIn, checkedInAt
  qr_payload TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. PERMISSIONS (DISABLE RLS FOR ANNOTATED REST CLIENT)
ALTER TABLE public.seats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
