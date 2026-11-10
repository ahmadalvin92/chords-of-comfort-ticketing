import fs from 'fs';
import path from 'path';
import { Seat, Order, CheckInResult, CustomerInfo, TicketItem } from '@/types/ticket';
import { generateInitialSeats } from '@/data/initialSeats';

interface DbData {
  seats: Seat[];
  orders: Order[];
  lastUpdated: string;
}

const DB_PATH = path.join(process.cwd(), 'data', 'ticketing-db.json');

function ensureDbFile(): DbData {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: DbData = {
      seats: generateInitialSeats(),
      orders: [],
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }

  try {
    const fileContent = fs.readFileSync(DB_PATH, 'utf8');
    const data = JSON.parse(fileContent) as DbData;
    return data;
  } catch {
    const initialData: DbData = {
      seats: generateInitialSeats(),
      orders: [],
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
}

function saveDb(data: DbData) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
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
    // Maybe raw string is orderId or ticket code
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
  saveDb(initialData);
  return initialData;
}

