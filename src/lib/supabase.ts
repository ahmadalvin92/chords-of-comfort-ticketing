import { createClient } from '@supabase/supabase-js';
import { Seat, Order, TicketCategory, SeatStatus, PaymentStatus, CustomerInfo, TicketItem } from '@/types/ticket';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cfamirjqdxpdhnwtsevw.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_dzdcTFUOt4_Opc8G3h2rhA_Q79WdhRA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
  },
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
  },
});

export interface SupabaseOrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string | null;
  total_amount: number;
  payment_status: string;
  payment_method?: string | null;
  items: TicketItem[] | string;
  qr_payload?: string | null;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseSeatRow {
  id: string;
  label: string;
  section: string;
  row: string;
  number: number;
  block?: string | null;
  category: string;
  price: number;
  status: string;
  held_until?: number | null;
  held_by?: string | null;
  order_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function orderToRow(order: Order): SupabaseOrderRow {
  return {
    id: order.id,
    customer_name: order.customer.fullName,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    notes: order.customer.notes || null,
    total_amount: order.totalAmount,
    payment_status: order.paymentStatus,
    payment_method: order.paymentMethod || 'TRANSFER_MANDIRI',
    items: order.items,
    qr_payload: order.qrPayload || null,
    paid_at: order.paidAt || null,
    created_at: order.createdAt,
    updated_at: new Date().toISOString(),
  };
}

export function rowToOrder(row: SupabaseOrderRow): Order {
  const parsedItems: TicketItem[] = Array.isArray(row.items)
    ? row.items
    : typeof row.items === 'string'
      ? JSON.parse(row.items)
      : [];

  return {
    id: row.id,
    createdAt: row.created_at || new Date().toISOString(),
    customer: {
      fullName: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      notes: row.notes || undefined,
    },
    items: parsedItems,
    totalAmount: row.total_amount,
    paymentStatus: (row.payment_status as PaymentStatus) || 'pending',
    paymentMethod: row.payment_method || 'TRANSFER_MANDIRI',
    paidAt: row.paid_at,
    qrPayload: row.qr_payload || '',
  };
}

export function seatToRow(seat: Seat): SupabaseSeatRow {
  return {
    id: seat.id,
    label: seat.label,
    section: seat.section,
    row: seat.row,
    number: seat.number,
    block: seat.block || null,
    category: seat.category,
    price: seat.price,
    status: seat.status,
    held_until: seat.heldUntil || null,
    held_by: seat.heldBy || null,
    order_id: seat.orderId || null,
    updated_at: new Date().toISOString(),
  };
}

export function rowToSeat(row: SupabaseSeatRow): Seat {
  return {
    id: row.id,
    label: row.label,
    section: (row.section as 'MAIN_FLOOR' | 'BALCONY') || 'MAIN_FLOOR',
    row: row.row,
    number: row.number,
    block: (row.block as 'LEFT' | 'CENTER' | 'RIGHT') || undefined,
    category: (row.category as TicketCategory) || 'REGULAR',
    price: row.price,
    status: (row.status as SeatStatus) || 'available',
    heldUntil: row.held_until ? Number(row.held_until) : null,
    heldBy: row.held_by,
    orderId: row.order_id,
  };
}

// ============================================================================
// SUPABASE ASYNC & ATOMIC HELPERS
// ============================================================================

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] orders fetch error:', error.message);
      return null;
    }
    return (data as SupabaseOrderRow[]).map(rowToOrder);
  } catch (err) {
    console.warn('[Supabase] fetchOrders exception:', (err as Error).message);
    return null;
  }
}

export async function fetchOrderByIdFromSupabase(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !data) return null;
    return rowToOrder(data as SupabaseOrderRow);
  } catch {
    return null;
  }
}

export async function insertOrderToSupabase(order: Order): Promise<boolean> {
  try {
    const row = orderToRow(order);
    const { error } = await supabase.from('orders').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] insertOrder error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] insertOrder exception:', (err as Error).message);
    return false;
  }
}

export async function updateOrderPaymentInSupabase(
  orderId: string,
  paymentStatus: string,
  paidAt?: string,
  paymentMethod?: string
): Promise<boolean> {
  try {
    const updates: Record<string, unknown> = {
      payment_status: paymentStatus,
      paid_at: paidAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (paymentMethod) {
      updates.payment_method = paymentMethod;
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.warn('[Supabase] updateOrderPayment error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateOrderPayment exception:', (err as Error).message);
    return false;
  }
}

export async function updateCustomerInSupabase(
  orderId: string,
  customer: CustomerInfo
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        customer_name: customer.fullName,
        customer_email: customer.email,
        customer_phone: customer.phone,
        notes: customer.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      console.warn('[Supabase] updateCustomer error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateCustomer exception:', (err as Error).message);
    return false;
  }
}

export async function updateOrderItemsInSupabase(orderId: string, items: TicketItem[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        items,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      console.warn('[Supabase] updateOrderItems error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateOrderItems exception:', (err as Error).message);
    return false;
  }
}

export async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      console.warn('[Supabase] deleteOrder error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] deleteOrder exception:', (err as Error).message);
    return false;
  }
}

export async function fetchSeatsFromSupabase(): Promise<Seat[] | null> {
  try {
    const { data, error } = await supabase.from('seats').select('*');
    if (error) {
      console.warn('[Supabase] seats fetch error:', error.message);
      return null;
    }
    if (!data || data.length === 0) return null;
    return (data as SupabaseSeatRow[]).map(rowToSeat);
  } catch (err) {
    console.warn('[Supabase] fetchSeats exception:', (err as Error).message);
    return null;
  }
}

export async function syncAllSeatsToSupabase(seats: Seat[]): Promise<boolean> {
  try {
    const rows = seats.map(seatToRow);
    const { error } = await supabase.from('seats').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] syncAllSeats error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] syncAllSeats exception:', (err as Error).message);
    return false;
  }
}

export async function updateSeatsStatusInSupabase(
  seatIds: string[],
  status: SeatStatus,
  heldBy?: string | null,
  heldUntil?: number | null,
  orderId?: string | null
): Promise<boolean> {
  if (seatIds.length === 0) return true;
  try {
    const updates: Partial<SupabaseSeatRow> = {
      status,
      held_by: heldBy || null,
      held_until: heldUntil || null,
      order_id: orderId || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('seats').update(updates).in('id', seatIds);

    if (error) {
      console.warn('[Supabase] updateSeatsStatus error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateSeatsStatus exception:', (err as Error).message);
    return false;
  }
}

/** Release only expired temporary pre-checkout cart holds (where order_id IS NULL). */
export async function releaseExpiredCartHoldsInSupabase(now: number): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('seats')
      .update({
        status: 'available',
        held_by: null,
        held_until: null,
        order_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('status', 'held')
      .is('order_id', null)
      .lt('held_until', now)
      .select('id');

    if (error || !data) {
      if (error) console.warn('[Supabase] releaseExpiredCartHolds error:', error.message);
      return [];
    }
    return (data as { id: string }[]).map((r) => r.id);
  } catch (err) {
    console.warn('[Supabase] releaseExpiredCartHolds exception:', (err as Error).message);
    return [];
  }
}

/**
 * Atomically lock pre-checkout cart holds in Supabase.
 * Only locks seats that are available OR already held by the same pre-checkout sessionId.
 */
export async function atomicHoldSeatsInSupabase(
  seatIds: string[],
  sessionId: string,
  heldUntil: number
): Promise<{ ok: boolean; reason?: 'conflict' | 'error' }> {
  if (seatIds.length === 0) return { ok: false, reason: 'error' };
  try {
    // Snapshot seats already held by this sessionId so rollback won't release existing holds
    const { data: existingRows } = await supabase
      .from('seats')
      .select('id, status, order_id, held_by')
      .in('id', seatIds);

    const alreadyHeldBySession = new Set(
      (existingRows || [])
        .filter((r) => r.status === 'held' && !r.order_id && r.held_by === sessionId)
        .map((r) => r.id as string)
    );

    const { data, error } = await supabase
      .from('seats')
      .update({
        status: 'held',
        held_by: sessionId,
        held_until: heldUntil,
        order_id: null,
        updated_at: new Date().toISOString(),
      })
      .in('id', seatIds)
      .neq('category', 'VIP')
      .or(`status.eq.available,and(status.eq.held,order_id.is.null,held_by.eq.${sessionId})`)
      .select('id');

    if (error) {
      console.warn('[Supabase] atomicHoldSeats error:', error.message);
      return { ok: false, reason: 'error' };
    }

    const updatedIds = (data as { id: string }[] | null)?.map((r) => r.id) || [];
    if (updatedIds.length !== seatIds.length) {
      const newlyLocked = updatedIds.filter((id) => !alreadyHeldBySession.has(id));
      if (newlyLocked.length > 0) {
        await supabase
          .from('seats')
          .update({
            status: 'available',
            held_by: null,
            held_until: null,
            order_id: null,
            updated_at: new Date().toISOString(),
          })
          .in('id', newlyLocked)
          .eq('held_by', sessionId)
          .is('order_id', null);
      }
      return { ok: false, reason: 'conflict' };
    }

    return { ok: true };
  } catch (err) {
    console.warn('[Supabase] atomicHoldSeats exception:', (err as Error).message);
    return { ok: false, reason: 'error' };
  }
}

/**
 * Atomically lock seats for a submitted pending order (`order_id = orderId`, `held_until = null`).
 * Submitted orders stay locked until Admin approves (`sold`) or deletes (`available`).
 */
export async function atomicLockOrderSeatsInSupabase(
  seatIds: string[],
  sessionId: string,
  orderId: string
): Promise<{ ok: boolean; reason?: 'conflict' | 'error' }> {
  if (seatIds.length === 0) return { ok: false, reason: 'error' };
  try {
    const { data, error } = await supabase
      .from('seats')
      .update({
        status: 'held',
        held_by: orderId,
        held_until: null,
        order_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .in('id', seatIds)
      .neq('category', 'VIP')
      .or(`status.eq.available,and(status.eq.held,order_id.is.null,held_by.eq.${sessionId})`)
      .select('id');

    if (error) {
      console.warn('[Supabase] atomicLockOrderSeats error:', error.message);
      return { ok: false, reason: 'error' };
    }

    const updatedIds = (data as { id: string }[] | null)?.map((r) => r.id) || [];
    if (updatedIds.length !== seatIds.length) {
      if (updatedIds.length > 0) {
        await supabase
          .from('seats')
          .update({
            status: 'available',
            held_by: null,
            held_until: null,
            order_id: null,
            updated_at: new Date().toISOString(),
          })
          .in('id', updatedIds)
          .eq('order_id', orderId);
      }
      return { ok: false, reason: 'conflict' };
    }

    return { ok: true };
  } catch (err) {
    console.warn('[Supabase] atomicLockOrderSeats exception:', (err as Error).message);
    return { ok: false, reason: 'error' };
  }
}

/** Release only pre-checkout session holds (`order_id IS NULL`). */
export async function atomicReleaseSessionSeatsInSupabase(
  seatIds: string[],
  sessionId: string
): Promise<boolean> {
  if (seatIds.length === 0) return true;
  try {
    const { error } = await supabase
      .from('seats')
      .update({
        status: 'available',
        held_by: null,
        held_until: null,
        order_id: null,
        updated_at: new Date().toISOString(),
      })
      .in('id', seatIds)
      .eq('status', 'held')
      .eq('held_by', sessionId)
      .is('order_id', null);

    if (error) {
      console.warn('[Supabase] atomicReleaseSessionSeats error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] atomicReleaseSessionSeats exception:', (err as Error).message);
    return false;
  }
}

/** Reset all orders and restore all seats in Supabase (Admin only). */
export async function resetAllInSupabase(seats: Seat[]): Promise<boolean> {
  try {
    const { error: delErr } = await supabase.from('orders').delete().neq('id', '__NONE__');
    if (delErr) {
      console.warn('[Supabase] reset delete orders error:', delErr.message);
    }
    const ok = await syncAllSeatsToSupabase(seats);
    return ok && !delErr;
  } catch (err) {
    console.warn('[Supabase] resetAll exception:', (err as Error).message);
    return false;
  }
}
