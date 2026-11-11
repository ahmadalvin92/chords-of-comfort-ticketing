import fs from 'fs';
import path from 'path';
import { Seat, Order, CheckInResult, CustomerInfo, TicketItem } from '@/types/ticket';
import { generateInitialSeats } from '@/data/initialSeats';

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

function ensureDbFile(): DbData {
  if (globalThis.__TICKETING_DB__) {
    return globalThis.__TICKETING_DB__;
  }

  // 1. Try reading from active DB_PATH (e.g. /tmp/ticketing-db.json)
  if (fs.existsSync(DB_PATH)) {
    try {
      const fileContent = fs.readFileSync(DB_PATH, 'utf8');
      const data = JSON.parse(fileContent) as DbData;
      globalThis.__TICKETING_DB__ = data;
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
      globalThis.__TICKETING_DB__ = data;
      saveDb(data); // Write to /tmp for future persistence
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
    // Graceful fallback: Serverless container memory still holds the data
    console.warn('Could not write to disk, using in-memory store:', (err as Error).message);
  }
}

// Clean up expired held seats (older than 10 mins)
function cleanupExpiredHolds(data: DbData): boolean {
  const now = Date.now();
  let changed = false;

  data.seats.forEach((seat) => {
    if (seat.status === 'held' && seat.heldUntil && seat.heldUntil < now) {
      seat.status = 'available';
      seat.heldUntil = null;
      seat.heldBy = null;
      changed = true;
    }
  });

  return changed;
}

export function getSeats(): Seat[] {
  const db = ensureDbFile();
  if (cleanupExpiredHolds(db)) {
    saveDb(db);
  }
  return db.seats;
}

export function holdSeats(
  seatIds: string[],
  sessionId: string,
  holdMinutes: number = 10
): { success: boolean; error?: string; heldSeats?: Seat[] } {
  const db = ensureDbFile();
  cleanupExpiredHolds(db);

  const unavailable: string[] = [];
  const targetSeats: Seat[] = [];

  for (const id of seatIds) {
    const seat = db.seats.find((s) => s.id === id);
    if (!seat) {
      return { success: false, error: `Kursi ${id} tidak ditemukan.` };
    }
    if (seat.status === 'sold') {
      unavailable.push(`${seat.label} (sudah terjual)`);
    } else if (seat.status === 'held' && seat.heldBy !== sessionId) {
      unavailable.push(`${seat.label} (sedang dipilih pembeli lain)`);
    } else {
      targetSeats.push(seat);
    }
  }

  if (unavailable.length > 0) {
    return {
      success: false,
      error: `Beberapa kursi tidak tersedia: ${unavailable.join(', ')}`,
    };
  }

  const expiry = Date.now() + holdMinutes * 60 * 1000;
  targetSeats.forEach((seat) => {
    seat.status = 'held';
    seat.heldBy = sessionId;
    seat.heldUntil = expiry;
  });

  saveDb(db);
  return { success: true, heldSeats: targetSeats };
}

export function releaseSeats(seatIds: string[], sessionId: string): boolean {
  const db = ensureDbFile();
  let changed = false;

  seatIds.forEach((id) => {
    const seat = db.seats.find((s) => s.id === id);
    if (seat && seat.status === 'held' && seat.heldBy === sessionId) {
      seat.status = 'available';
      seat.heldBy = null;
      seat.heldUntil = null;
      changed = true;
    }
  });

  if (changed) {
    saveDb(db);
  }
  return changed;
}

export function createOrder(
  customer: CustomerInfo,
  seatIds: string[],
  sessionId: string,
  paymentMethod: string = 'QRIS'
): { success: boolean; order?: Order; error?: string } {
  const db = ensureDbFile();
  cleanupExpiredHolds(db);

  // Validate seats
  const selectedSeats: Seat[] = [];
  for (const id of seatIds) {
    const seat = db.seats.find((s) => s.id === id);
    if (!seat) {
      return { success: false, error: `Kursi dengan ID ${id} tidak ditemukan.` };
    }
    if (seat.status === 'sold') {
      return { success: false, error: `Kursi ${seat.label} sudah terjual.` };
    }
    if (seat.status === 'held' && seat.heldBy !== sessionId) {
      return { success: false, error: `Kursi ${seat.label} sedang dipesan oleh pengguna lain.` };
    }
    selectedSeats.push(seat);
  }

  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
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

  // Hold seats permanently with orderId
  selectedSeats.forEach((seat) => {
    seat.status = 'held';
    seat.heldBy = orderId;
    seat.heldUntil = Date.now() + 15 * 60 * 1000; // 15 mins for payment window
  });

  db.orders.push(order);
  saveDb(db);

  return { success: true, order };
}

export function confirmPayment(
  orderId: string,
  paymentMethod?: string
): { success: boolean; order?: Order; error?: string } {
  const db = ensureDbFile();
  const order = db.orders.find((o) => o.id === orderId);

  if (!order) {
    return { success: false, error: `Order ${orderId} tidak ditemukan.` };
  }

  if (order.paymentStatus === 'paid') {
    return { success: true, order };
  }

  order.paymentStatus = 'paid';
  order.paidAt = new Date().toISOString();
  if (paymentMethod) {
    order.paymentMethod = paymentMethod;
  }

  // Mark all seats as sold
  order.items.forEach((item) => {
    const seat = db.seats.find((s) => s.id === item.seatId);
    if (seat) {
      seat.status = 'sold';
      seat.orderId = orderId;
      seat.heldBy = null;
      seat.heldUntil = null;
    }
  });

  saveDb(db);
  return { success: true, order };
}

export function getOrder(orderId: string): Order | null {
  const db = ensureDbFile();
  const order = db.orders.find((o) => o.id === orderId);
  return order || null;
}

export function getAllOrders(): Order[] {
  const db = ensureDbFile();
  return db.orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function validateTicketQR(qrPayload: string): CheckInResult {
  const db = ensureDbFile();

  let parsed: { orderId?: string; secretHash?: string } = {};
  try {
    parsed = JSON.parse(qrPayload);
  } catch {
    parsed = { orderId: qrPayload.trim() };
  }

  const orderId = parsed.orderId;
  if (!orderId) {
    return {
      status: 'INVALID',
      message: 'Format QR Code tidak dikenali!',
    };
  }

  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return {
      status: 'INVALID',
      message: `Tiket tidak ditemukan dalam database (ID: ${orderId})`,
    };
  }

  if (order.paymentStatus !== 'paid') {
    return {
      status: 'INVALID',
      message: `Tiket belum lunas (Status: ${order.paymentStatus.toUpperCase()})`,
    };
  }

  // Check if all items already checked in
  const alreadyCheckedIn = order.items.every((item) => item.isCheckedIn);
  if (alreadyCheckedIn) {
    const firstCheckInTime = order.items[0]?.checkedInAt;
    return {
      status: 'ALREADY_CHECKED_IN',
      message: `Tiket sudah pernah digunakan untuk check-in!`,
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

  // Mark check in
  const now = new Date().toISOString();
  order.items.forEach((item) => {
    item.isCheckedIn = true;
    item.checkedInAt = now;
  });

  saveDb(db);

  return {
    status: 'VALID',
    message: `Tiket Valid! Selamat Menikmati Pertunjukan 🎉`,
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

export function resetDatabase() {
  const initialData: DbData = {
    seats: generateInitialSeats(),
    orders: [],
    lastUpdated: new Date().toISOString(),
  };
  globalThis.__TICKETING_DB__ = initialData;
  saveDb(initialData);
  return initialData;
}

export function manualToggleCheckIn(orderId: string): { success: boolean; isCheckedIn?: boolean; error?: string } {
  const db = ensureDbFile();
  const order = db.orders.find((o) => o.id === orderId);

  if (!order) {
    return { success: false, error: `Order ${orderId} tidak ditemukan.` };
  }

  // Toggle state
  const willBeCheckedIn = !order.items.every((it) => it.isCheckedIn);
  const now = willBeCheckedIn ? new Date().toISOString() : null;

  order.items.forEach((item) => {
    item.isCheckedIn = willBeCheckedIn;
    item.checkedInAt = now;
  });

  saveDb(db);
  return { success: true, isCheckedIn: willBeCheckedIn };
}

export function deleteOrder(orderId: string): { success: boolean; error?: string } {
  const db = ensureDbFile();
  const orderIdx = db.orders.findIndex((o) => o.id === orderId);

  if (orderIdx === -1) {
    return { success: false, error: `Order ${orderId} tidak ditemukan.` };
  }

  const order = db.orders[orderIdx];

  // Free up associated seats
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

export function manualCreateOrder(
  customer: CustomerInfo,
  seatIds: string[],
  paymentMethod: string = 'MANUAL_CASH',
  isPaid: boolean = true
): { success: boolean; order?: Order; error?: string } {
  const db = ensureDbFile();

  const selectedSeats: Seat[] = [];
  for (const id of seatIds) {
    const seat = db.seats.find((s) => s.id === id);
    if (!seat) {
      return { success: false, error: `Kursi ${id} tidak ditemukan.` };
    }
    if (seat.status === 'sold') {
      return { success: false, error: `Kursi ${seat.label} sudah terjual.` };
    }
    selectedSeats.push(seat);
  }

  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
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

  selectedSeats.forEach((seat) => {
    seat.status = isPaid ? 'sold' : 'held';
    seat.orderId = isPaid ? orderId : null;
    seat.heldBy = isPaid ? null : orderId;
    seat.heldUntil = isPaid ? null : Date.now() + 60 * 60 * 1000;
  });

  db.orders.push(order);
  saveDb(db);

  return { success: true, order };
}
