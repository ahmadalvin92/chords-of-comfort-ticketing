-- ====================================================================
-- LSPR COMM30-6SP THEATER PRODUCTION TICKETING SYSTEM
-- SUPABASE / POSTGRESQL PRODUCTION DATABASE SCHEMA
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SEATS TABLE (400 VENUE SEATS)
CREATE TABLE IF NOT EXISTS public.seats (
  id TEXT PRIMARY KEY,                       -- e.g. 'MF-A1-L12', 'BAL-R1-C5'
  label TEXT NOT NULL,                      -- e.g. 'A1-L12', 'R1-C5'
  section TEXT NOT NULL,                    -- 'MAIN_FLOOR' | 'BALCONY'
  sub_section TEXT,                         -- 'LEFT' | 'CENTER' | 'RIGHT'
  row TEXT NOT NULL,                        -- 'A1'..'A10' or 'R1'..'R3'
  number INT NOT NULL,
  category TEXT NOT NULL,                   -- 'VIP' | 'SAPPHIRE' | 'DIAMOND' | 'PLATINUM' | 'RUBY'
  price INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'held' | 'sold'
  held_until TIMESTAMPTZ,
  held_by TEXT,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy seat locking during rush ticket booking
CREATE INDEX IF NOT EXISTS idx_seats_status_category ON public.seats(status, category);
CREATE INDEX IF NOT EXISTS idx_seats_held_until ON public.seats(held_until);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,                       -- e.g. 'LSPR-6SP-7K9A2M'
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  notes TEXT,
  total_amount INT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'expired'
  payment_method TEXT DEFAULT 'QRIS',
  snap_token TEXT,
  qr_payload TEXT NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- 4. TICKET ITEMS TABLE (Individual Seat Passes)
CREATE TABLE IF NOT EXISTS public.ticket_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  seat_id TEXT NOT NULL REFERENCES public.seats(id),
  seat_label TEXT NOT NULL,
  category TEXT NOT NULL,
  price INT NOT NULL,
  ticket_code TEXT NOT NULL UNIQUE,          -- e.g. 'TCK-LSPR-6SP-XXXX-A1-L12'
  is_checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_items_code ON public.ticket_items(ticket_code);
CREATE INDEX IF NOT EXISTS idx_ticket_items_checkin ON public.ticket_items(is_checked_in);

-- 5. ROW LOCKING FUNCTION (ATOMIC PREVENT DOUBLE BOOKING)
CREATE OR REPLACE FUNCTION hold_seats_atomic(
  p_seat_ids TEXT[],
  p_session_id TEXT,
  p_hold_duration_minutes INT DEFAULT 10
)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
DECLARE
  v_conflict_count INT;
BEGIN
  -- 1. Check if any seat is already sold or held by someone else
  SELECT COUNT(*) INTO v_conflict_count
  FROM public.seats
  WHERE id = ANY(p_seat_ids)
    AND (
      status = 'sold'
      OR (status = 'held' AND held_by != p_session_id AND held_until > NOW())
    );

  IF v_conflict_count > 0 THEN
    RETURN QUERY SELECT FALSE, 'Beberapa kursi yang Anda pilih sudah tidak tersedia atau sedang dipesan orang lain.'::TEXT;
    RETURN;
  END IF;

  -- 2. Lock and hold the seats
  UPDATE public.seats
  SET
    status = 'held',
    held_by = p_session_id,
    held_until = NOW() + (p_hold_duration_minutes || ' minutes')::INTERVAL,
    updated_at = NOW()
  WHERE id = ANY(p_seat_ids);

  RETURN QUERY SELECT TRUE, 'Kursi berhasil dikunci untuk Anda.'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 6. REALTIME PUBLICATION ENABLEMENT (OPTIONAL FOR LIVE COLOR UPDATES)
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;

