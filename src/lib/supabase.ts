import { createClient } from '@supabase/supabase-js';
import { Seat, Order, TicketCategory, SeatStatus, PaymentStatus, CustomerInfo } from '@/types/ticket';

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
  items: any; // JSONB
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
    payment_method: order.paymentMethod || 'TRANSFER_BCA',
    items: order.items,
    qr_payload: order.qrPayload,
    paid_at: order.paidAt || null,
    created_at: order.createdAt,
    updated_at: new Date().toISOString(),
  };
}

export function rowToOrder(row: SupabaseOrderRow): Order {
  return {
    id: row.id,
    createdAt: row.created_at || new Date().toISOString(),
    customer: {
      fullName: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      notes: row.notes || undefined,
    },
    items: Array.isArray(row.items) ? row.items : [],
    totalAmount: row.total_amount,
    paymentStatus: (row.payment_status as PaymentStatus) || 'pending',
    paymentMethod: row.payment_method || 'TRANSFER_BCA',
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
// SUPABASE ASYNC HELPERS (WITH SAFE ERROR HANDLING)
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
  paidAt?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        paid_at: paidAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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

export async function updateOrderItemsInSupabase(orderId: string, items: any[]): Promise<boolean> {
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
