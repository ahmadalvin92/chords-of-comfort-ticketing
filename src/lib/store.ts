import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Seat, Order, CheckInResult, CustomerInfo, TicketItem } from '@/types/ticket';
import { generateInitialSeats } from '@/data/initialSeats';
import {
  fetchOrdersFromSupabase,
  fetchOrderByIdFromSupabase,
  fetchSeatsFromSupabase,
  syncAllSeatsToSupabase,
  insertOrderToSupabase,
  updateOrderPaymentInSupabase,
  updateCustomerInSupabase,
  updateOrderItemsInSupabase,
  deleteOrderFromSupabase,
  updateSeatsStatusInSupabase,
  releaseExpiredCartHoldsInSupabase,
  atomicHoldSeatsInSupabase,
  atomicLockOrderSeatsInSupabase,
  atomicReleaseSessionSeatsInSupabase,
  resetAllInSupabase,
} from './supabase';

interface DbData {
  seats: Seat[];
  orders: Order[];
  lastUpdated: string;
}

// Global in-memory cache for serverless environments (e.g. Vercel)
declare global {
  var __TICKETING_DB__: DbData | undefined;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Use /tmp on Vercel / serverless because /var/task is strictly read-only
const DB_PATH = isServerless
  ? path.join('/tmp', 'ticketing-db.json')
  : path.join(process.cwd(), 'data', 'ticketing-db.json');

const BUNDLED_DB_PATH = path.join(process.cwd(), 'data', 'ticketing-db.json');

function isSeatSchemaCurrent(seats: Seat[]): boolean {
  if (!Array.isArray(seats) || seats.length !== 297) return false;
  const hasMfH15 = seats.some((s) => s.id === 'MF-H-15');
  const hasRemovedBal25 = seats.some((s) => s.id === 'BAL-AA-25');
  const balAa17 = seats.find((s) => s.id === 'BAL-AA-17');
  return hasMfH15 && !hasRemovedBal25 && balAa17?.category === 'REGULAR';
}

function ensureDbFile(): DbData {
  if (globalThis.__TICKETING_DB__ && isSeatSchemaCurrent(globalThis.__TICKETING_DB__.seats)) {
    return globalThis.__TICKETING_DB__;
  }

  // 1. Try reading from active DB_PATH (e.g. /tmp/ticketing-db.json)
  if (fs.existsSync(DB_PATH)) {
    try {
      const fileContent = fs.readFileSync(DB_PATH, 'utf8');
      const data = JSON.parse(fileContent) as DbData;
      if (!isSeatSchemaCurrent(data.seats)) {
        data.seats = generateInitialSeats();
        saveDb(data);
      } else {
        globalThis.__TICKETING_DB__ = data;
      }
      return data;
    } catch {
      // Continue fallback
    }
  }

  // 2. Try reading from bundled initial DB (read-only in /var/task/data/ticketing-db.json)
  if (fs.existsSync(BUNDLED_DB_PATH)) {
    try {
      const fileContent = fs.readFileSync(BUNDLED_DB_PATH, 'utf8');
      const data = JSON.parse(fileContent) as DbData;
      if (!isSeatSchemaCurrent(data.seats)) {
        data.seats = generateInitialSeats();
      }
      globalThis.__TICKETING_DB__ = data;
      saveDb(data);
      return data;
    } catch {
      // Continue fallback
    }
  }

  // 3. Fallback: generate fresh initial seats
  const initialData: DbData = {
    seats: generateInitialSeats(),
    orders: [],
    lastUpdated: new Date().toISOString(),
  };

  globalThis.__TICKETING_DB__ = initialData;
  saveDb(initialData);
  return initialData;
}

function saveDb(data: DbData) {
  data.lastUpdated = new Date().toISOString();
  globalThis.__TICKETING_DB__ = data;

  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write to disk, using in-memory store:', (err as Error).message);
  }
}

/**
 * Clean up expired temporary cart holds (`!seat.orderId`).
 * Submitted pending orders (`seat.orderId` present) remain safely held until Admin verifies or deletes them.
 */
async function cleanupExpiredHolds(data: DbData, syncSupabase: boolean = true): Promise<boolean> {
  const now = Date.now();
  const expiredSeatIds: string[] = [];

  data.seats.forEach((seat) => {
    if (seat.status === 'held' && !seat.orderId && seat.heldUntil && seat.heldUntil < now) {
      seat.status = 'available';
      seat.heldUntil = null;
      seat.heldBy = null;
      expiredSeatIds.push(seat.id);
    }
  });

  if (syncSupabase) {
    const sbExpired = await releaseExpiredCartHoldsInSupabase(now);
    if (sbExpired.length > 0) {
      sbExpired.forEach((id) => {
        const seat = data.seats.find((s) => s.id === id);
        if (seat && !seat.orderId) {
          seat.status = 'available';
          seat.heldUntil = null;
          seat.heldBy = null;
        }
      });
      return true;
    }
  }

  return expiredSeatIds.length > 0;
}

/** Sync local cache cleanly from Supabase (source of truth across serverless instances). */
export async function syncFromSupabase(includeOrders: boolean = true): Promise<DbData> {
  const db = ensureDbFile();

  try {
    const [sbSeats, sbOrders] = await Promise.all([
      fetchSeatsFromSupabase(),
      includeOrders ? fetchOrdersFromSupabase() : Promise.resolve(null),
    ]);

    if (sbSeats && sbSeats.length > 0) {
      mergeSupabaseSeats(sbSeats);
    } else if (sbSeats === null) {
      // Table might be empty or unreachable; don't overwrite Supabase blindly unless truly empty
    }

    if (includeOrders && Array.isArray(sbOrders)) {
      mergeSupabaseOrders(sbOrders);
    }
  } catch (err) {
    console.warn('[Store] Supabase sync warning:', (err as Error).message);
  }

  if (await cleanupExpiredHolds(db, true)) {
    saveDb(db);
  }

  return db;
}

export async function getSeats(): Promise<Seat[]> {
  const db = ensureDbFile();
  try {
    const sbSeats = await fetchSeatsFromSupabase();
    if (sbSeats && sbSeats.length > 0) {
      mergeSupabaseSeats(sbSeats);
    } else {
      await syncAllSeatsToSupabase(db.seats);
    }
  } catch (err) {
    console.warn('[Store] getSeats sync fallback:', (err as Error).message);
  }

  if (await cleanupExpiredHolds(db, true)) {
    saveDb(db);
  }
  return db.seats;
}

export async function holdSeats(
  rawSeatIds: string[],
  sessionId: string,
  holdMinutes: number = 10
): Promise<{ success: boolean; error?: string; heldSeats?: Seat[] }> {
  const seatIds = Array.from(new Set(rawSeatIds));
  if (seatIds.length === 0 || seatIds.length > 6) {
    return { success: false, error: 'You can hold between 1 and 6 seats per transaction.' };
  }

  const db = await syncFromSupabase(false);

  const unavailable: string[] = [];
  const targetSeats: Seat[] = [];

  for (const id of seatIds) {
    const seat = db.seats.find((s) => s.id === id);
    if (!seat) {
      return { success: false, error: `Seat ${id} not found.` };
    }
    if (seat.category === 'VIP') {
      unavailable.push(`${seat.label} (Main Floor VIP seats are reserved for invitations only)`);
    } else if (seat.status === 'sold') {
      unavailable.push(`${seat.label} (already sold)`);
    } else if (seat.status === 'held' && (seat.orderId || seat.heldBy !== sessionId)) {
      unavailable.push(`${seat.label} (temporarily held by another buyer)`);
    } else {
      targetSeats.push(seat);
    }
  }

  if (unavailable.length > 0) {
    return {
      success: false,
      error: `Some selected seats are unavailable: ${unavailable.join(', ')}`,
    };
  }

  const expiry = Date.now() + holdMinutes * 60 * 1000;

  // Atomic conditional lock in Supabase across concurrent instances
  const atomicRes = await atomicHoldSeatsInSupabase(seatIds, sessionId, expiry);
  if (!atomicRes.ok) {
    // Refresh seats so client gets updated state
    await syncFromSupabase(false);
    return {
      success: false,
      error: 'One or more selected seats were just reserved by another attendee. Please pick another seat.',
    };
  }

  targetSeats.forEach((seat) => {
    seat.status = 'held';
    seat.heldBy = sessionId;
    seat.heldUntil = expiry;
    seat.orderId = null;
  });

  saveDb(db);
  return { success: true, heldSeats: targetSeats };
}

export async function releaseSeats(rawSeatIds: string[], sessionId: string): Promise<boolean> {
  const seatIds = Array.from(new Set(rawSeatIds));
  if (seatIds.length === 0) return false;

  const db = await syncFromSupabase(false);
  let changed = false;

  seatIds.forEach((id) => {
    const seat = db.seats.find((s) => s.id === id);
    if (seat && seat.status === 'held' && !seat.orderId && seat.heldBy === sessionId) {
      seat.status = 'available';
      seat.heldBy = null;
      seat.heldUntil = null;
      changed = true;
    }
  });

  await atomicReleaseSessionSeatsInSupabase(seatIds, sessionId);

  if (changed) {
    saveDb(db);
  }
  return changed;
}

export async function createOrder(
  customer: CustomerInfo,
  rawSeatIds: string[],
  sessionId: string,
  paymentMethod: string = 'TRANSFER_MANDIRI'
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const seatIds = Array.from(new Set(rawSeatIds));
  if (seatIds.length === 0 || seatIds.length > 6) {
    return { success: false, error: 'You must select between 1 and 6 seats per order.' };
  }

  const db = await syncFromSupabase(true);

  const selectedSeats: Seat[] = [];
  for (const id of seatIds) {
    const seat = db.seats.find((s) => s.id === id);
    if (!seat) {
      return { success: false, error: `Seat with ID ${id} not found.` };
    }
    if (seat.category === 'VIP') {
      return {
        success: false,
        error: `Seat ${seat.label} is VIP Main Floor and exclusively reserved for invitations.`,
      };
    }
    if (seat.status === 'sold') {
      return { success: false, error: `Seat ${seat.label} is already sold.` };
    }
    if (seat.status === 'held' && (seat.orderId || seat.heldBy !== sessionId)) {
      return { success: false, error: `Seat ${seat.label} is currently reserved by another buyer.` };
    }
    selectedSeats.push(seat);
  }

  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const orderId = `LSPR-6SP-${randomSuffix}`;
  let totalAmount = 0;

  const items: TicketItem[] = selectedSeats.map((seat, index) => {
    totalAmount += seat.price;
    const ticketCode = `TCK-${orderId}-${seat.label}-${index + 1}`;
    return {
      seatId: seat.id,
      seatLabel: seat.label,
      category: seat.category,
      price: seat.price,
      ticketCode,
      isCheckedIn: false,
      checkedInAt: null,
    };
  });

  const qrPayload = JSON.stringify({
    orderId,
    customerName: customer.fullName,
    seats: items.map((i) => i.seatLabel),
    category: items[0]?.category,
    secretHash: Buffer.from(`${orderId}-COMM30-6SP`).toString('base64'),
  });

  const order: Order = {
    id: orderId,
    createdAt: new Date().toISOString(),
    customer,
    items,
    totalAmount,
    paymentStatus: 'pending',
    paymentMethod,
    paidAt: null,
    qrPayload,
  };

  // Atomically lock seats for this order in Supabase BEFORE inserting order
  const lockRes = await atomicLockOrderSeatsInSupabase(seatIds, sessionId, orderId);
  if (!lockRes.ok) {
    await syncFromSupabase(false);
    return {
      success: false,
      error: 'One or more seats were just claimed by another booking. Please re-select available seats.',
    };
  }

  const inserted = await insertOrderToSupabase(order);
  if (!inserted) {
    // Rollback seat locks if order insert failed
    await updateSeatsStatusInSupabase(seatIds, 'available', null, null, null);
    return {
      success: false,
      error: 'Failed to save reservation to database. Please try again.',
    };
  }

  selectedSeats.forEach((seat) => {
    seat.status = 'held';
    seat.heldBy = orderId;
    seat.heldUntil = null;
    seat.orderId = orderId;
  });

  db.orders.unshift(order);
  saveDb(db);

  return { success: true, order };
}

export async function confirmPayment(
  orderId: string,
  paymentMethod?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const db = await syncFromSupabase(true);
  const order = db.orders.find((o) => o.id === orderId);

  if (!order) {
    return { success: false, error: `Order ${orderId} not found.` };
  }

  if (order.paymentStatus === 'paid') {
    return { success: true, order };
  }

  // Verify none of the seats were already sold to a different order
  for (const item of order.items) {
    const seat = db.seats.find((s) => s.id === item.seatId);
    if (seat && seat.status === 'sold' && seat.orderId && seat.orderId !== orderId) {
      return {
        success: false,
        error: `Seat ${seat.label} has already been sold to another order (#${seat.orderId}).`,
      };
    }
  }

  const paidAt = new Date().toISOString();
  order.paymentStatus = 'paid';
  order.paidAt = paidAt;
  if (paymentMethod) {
    order.paymentMethod = paymentMethod;
  }

  order.items.forEach((item) => {
    const seat = db.seats.find((s) => s.id === item.seatId);
    if (seat) {
      seat.status = 'sold';
      seat.orderId = orderId;
      seat.heldBy = null;
      seat.heldUntil = null;
    }
  });

  const seatIds = order.items.map((i) => i.seatId);
  await Promise.all([
    updateOrderPaymentInSupabase(orderId, 'paid', paidAt, order.paymentMethod),
    updateSeatsStatusInSupabase(seatIds, 'sold', null, null, orderId),
  ]);

  saveDb(db);
  return { success: true, order };
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const sbOrder = await fetchOrderByIdFromSupabase(orderId);
  const db = ensureDbFile();

  if (sbOrder) {
    const idx = db.orders.findIndex((o) => o.id === sbOrder.id);
    if (idx === -1) db.orders.push(sbOrder);
    else db.orders[idx] = sbOrder;
    saveDb(db);
    return sbOrder;
  }

  return db.orders.find((o) => o.id === orderId) || null;
}

export async function getAllOrders(): Promise<Order[]> {
  const db = await syncFromSupabase(true);
  return db.orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function validateTicketQR(qrPayload: string): Promise<CheckInResult> {
  const db = await syncFromSupabase(true);

  let parsed: { orderId?: string; secretHash?: string; ticketCode?: string } = {};
  let isJsonQr = false;
  try {
    const obj = JSON.parse(qrPayload);
    if (obj && typeof obj === 'object') {
      parsed = obj;
      isJsonQr = true;
    }
  } catch {
    const raw = qrPayload.trim().replace(/^#/, '').toUpperCase();
    parsed = { orderId: raw, ticketCode: raw };
  }

  if (isJsonQr) {
    if (!parsed.orderId || !parsed.secretHash) {
      return {
        status: 'INVALID',
        message: 'Unrecognized QR Code format!',
      };
    }
    const expectedHash = Buffer.from(`${parsed.orderId}-COMM30-6SP`).toString('base64');
    if (parsed.secretHash !== expectedHash) {
      return {
        status: 'INVALID',
        message: 'Invalid QR security signature!',
      };
    }
  }

  const lookupId = parsed.orderId;
  if (!lookupId) {
    return {
      status: 'INVALID',
      message: 'Unrecognized QR Code or Ticket ID!',
    };
  }

  const order = db.orders.find(
    (o) =>
      o.id.toUpperCase() === lookupId.toUpperCase() ||
      o.items.some((item) => item.ticketCode.toUpperCase() === lookupId.toUpperCase())
  );

  if (!order) {
    return {
      status: 'INVALID',
      message: `Ticket not found in database (ID: ${lookupId})`,
    };
  }

  if (order.paymentStatus !== 'paid') {
    return {
      status: 'INVALID',
      message: `Ticket payment incomplete (Status: ${order.paymentStatus.toUpperCase()})`,
    };
  }

  const alreadyCheckedIn = order.items.every((item) => item.isCheckedIn);
  if (alreadyCheckedIn) {
    const firstCheckInTime = order.items[0]?.checkedInAt;
    return {
      status: 'ALREADY_CHECKED_IN',
      message: 'Ticket has already been checked in!',
      checkedInAt: firstCheckInTime,
      order: {
        id: order.id,
        customerName: order.customer.fullName,
        seatLabels: order.items.map((i) => i.seatLabel),
        category: order.items[0]?.category || '',
        paidAt: order.paidAt,
      },
    };
  }

  const now = new Date().toISOString();
  order.items.forEach((item) => {
    item.isCheckedIn = true;
    item.checkedInAt = now;
  });

  await updateOrderItemsInSupabase(order.id, order.items);
  saveDb(db);

  return {
    status: 'VALID',
    message: 'Ticket Valid! Enjoy the performance 🎉',
    checkedInAt: now,
    order: {
      id: order.id,
      customerName: order.customer.fullName,
      seatLabels: order.items.map((i) => i.seatLabel),
      category: order.items[0]?.category || '',
      paidAt: order.paidAt,
    },
  };
}

export async function resetDatabase(): Promise<DbData> {
  const initialData: DbData = {
    seats: generateInitialSeats(),
    orders: [],
    lastUpdated: new Date().toISOString(),
  };
  await resetAllInSupabase(initialData.seats);
  globalThis.__TICKETING_DB__ = initialData;
  saveDb(initialData);
  return initialData;
}

export async function manualToggleCheckIn(
  orderId: string
): Promise<{ success: boolean; isCheckedIn?: boolean; error?: string }> {
  const db = await syncFromSupabase(true);
  const order = db.orders.find((o) => o.id === orderId);

  if (!order) {
    return { success: false, error: `Order ${orderId} not found.` };
  }

  if (order.paymentStatus !== 'paid') {
    return {
      success: false,
      error: 'Cannot check in an unpaid order. Please approve payment first.',
    };
  }

  const willBeCheckedIn = !order.items.every((it) => it.isCheckedIn);
  const now = willBeCheckedIn ? new Date().toISOString() : null;

  order.items.forEach((item) => {
    item.isCheckedIn = willBeCheckedIn;
    item.checkedInAt = now;
  });

  await updateOrderItemsInSupabase(order.id, order.items);
  saveDb(db);

  return { success: true, isCheckedIn: willBeCheckedIn };
}

export async function deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const db = await syncFromSupabase(true);
  const orderIdx = db.orders.findIndex((o) => o.id === orderId);

  if (orderIdx === -1) {
    return { success: false, error: `Order ${orderId} not found.` };
  }

  const order = db.orders[orderIdx];
  const seatIds = order.items.map((i) => i.seatId);

  await Promise.all([
    deleteOrderFromSupabase(orderId),
    updateSeatsStatusInSupabase(seatIds, 'available', null, null, null),
  ]);

  order.items.forEach((item) => {
    const seat = db.seats.find((s) => s.id === item.seatId);
    if (seat && (seat.orderId === orderId || seat.heldBy === orderId)) {
      seat.status = 'available';
      seat.orderId = null;
      seat.heldBy = null;
      seat.heldUntil = null;
    }
  });

  db.orders.splice(orderIdx, 1);
  saveDb(db);

  return { success: true };
}

export async function updateCustomerInfo(
  orderId: string,
  customerUpdates: Partial<CustomerInfo>
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const db = await syncFromSupabase(true);
  const order = db.orders.find((o) => o.id === orderId);

  if (!order) {
    return { success: false, error: `Order ${orderId} not found.` };
  }

  order.customer = {
    ...order.customer,
    ...customerUpdates,
  };

  await updateCustomerInSupabase(orderId, order.customer);
  saveDb(db);

  return { success: true, order };
}

export async function manualCreateOrder(
  customer: CustomerInfo,
  rawSeatIds: string[],
  paymentMethod: string = 'MANUAL_CASH',
  isPaid: boolean = true
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const seatIds = Array.from(new Set(rawSeatIds));
  if (seatIds.length === 0) {
    return { success: false, error: 'At least one seat must be specified.' };
  }

  const db = await syncFromSupabase(true);

  const selectedSeats: Seat[] = [];
  for (const id of seatIds) {
    const seat = db.seats.find((s) => s.id === id);
    if (!seat) {
      return { success: false, error: `Seat ${id} not found.` };
    }
    if (seat.status === 'sold' || (seat.status === 'held' && seat.orderId)) {
      return { success: false, error: `Seat ${seat.label} is already sold or reserved.` };
    }
    selectedSeats.push(seat);
  }

  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const orderId = `LSPR-ADM-${randomSuffix}`;
  let totalAmount = 0;

  const items: TicketItem[] = selectedSeats.map((seat, index) => {
    totalAmount += seat.price;
    const ticketCode = `TCK-${orderId}-${seat.label}-${index + 1}`;
    return {
      seatId: seat.id,
      seatLabel: seat.label,
      category: seat.category,
      price: seat.price,
      ticketCode,
      isCheckedIn: false,
      checkedInAt: null,
    };
  });

  const qrPayload = JSON.stringify({
    orderId,
    customerName: customer.fullName,
    seats: items.map((i) => i.seatLabel),
    category: items[0]?.category,
    secretHash: Buffer.from(`${orderId}-COMM30-6SP`).toString('base64'),
  });

  const now = new Date().toISOString();
  const order: Order = {
    id: orderId,
    createdAt: now,
    customer,
    items,
    totalAmount,
    paymentStatus: isPaid ? 'paid' : 'pending',
    paymentMethod,
    paidAt: isPaid ? now : null,
    qrPayload,
  };

  await insertOrderToSupabase(order);
  await updateSeatsStatusInSupabase(
    seatIds,
    isPaid ? 'sold' : 'held',
    isPaid ? null : orderId,
    null,
    orderId
  );

  selectedSeats.forEach((seat) => {
    seat.status = isPaid ? 'sold' : 'held';
    seat.orderId = orderId;
    seat.heldBy = isPaid ? null : orderId;
    seat.heldUntil = null;
  });

  db.orders.unshift(order);
  saveDb(db);

  return { success: true, order };
}

// ============================================================================
// SUPABASE REALTIME / IN-MEMORY CACHE MERGE HELPERS
// ============================================================================

export function mergeSupabaseOrders(supabaseOrders: Order[]) {
  const db = ensureDbFile();
  db.orders = supabaseOrders;
  saveDb(db);
}

export function mergeSupabaseSeats(supabaseSeats: Seat[]) {
  const db = ensureDbFile();
  const supabaseMap = new Map(supabaseSeats.map((s) => [s.id, s]));
  let changed = false;

  db.seats.forEach((seat) => {
    const sbSeat = supabaseMap.get(seat.id);
    if (sbSeat) {
      if (
        seat.status !== sbSeat.status ||
        seat.orderId !== sbSeat.orderId ||
        seat.heldBy !== sbSeat.heldBy ||
        seat.heldUntil !== sbSeat.heldUntil ||
        seat.category !== sbSeat.category ||
        seat.price !== sbSeat.price
      ) {
        seat.status = sbSeat.status;
        seat.orderId = sbSeat.orderId;
        seat.heldBy = sbSeat.heldBy;
        seat.heldUntil = sbSeat.heldUntil;
        seat.category = sbSeat.category;
        seat.price = sbSeat.price;
        changed = true;
      }
    }
  });

  if (changed) {
    saveDb(db);
  }
}
