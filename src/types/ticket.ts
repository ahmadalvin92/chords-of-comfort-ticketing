export type TicketCategory = 'VIP' | 'DIAMOND' | 'RUBY' | 'SAPPHIRE' | 'PLATINUM';

export type SeatStatus = 'available' | 'held' | 'sold';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface Seat {
  id: string; // e.g. "MF-A1-01", "BAL-R1-C05"
  label: string; // e.g. "A1-01", "R1-C5"
  section: 'MAIN_FLOOR' | 'BALCONY';
  row: string; // "A1", "A2", ... "A10" or "R1", "R2", "R3"
  number: number;
  subSection?: 'LEFT' | 'CENTER' | 'RIGHT';
  category: TicketCategory;
  price: number;
  status: SeatStatus;
  heldUntil?: number | null; // Unix timestamp ms
  heldBy?: string | null; // Session ID or Order ID
  orderId?: string | null;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface TicketItem {
  seatId: string;
  seatLabel: string;
  category: TicketCategory;
  price: number;
  ticketCode: string; // Unique ticket verification code
  isCheckedIn: boolean;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
}

export interface Order {
  id: string; // e.g. "LSPR-6SP-XXXXXX"
  createdAt: string;
  customer: CustomerInfo;
  items: TicketItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paidAt?: string | null;
  snapToken?: string;
  qrPayload: string; // Combined validation payload
}

export interface CheckInResult {
  status: 'VALID' | 'ALREADY_CHECKED_IN' | 'INVALID';
  message: string;
  order?: {
    id: string;
    customerName: string;
    seatLabels: string[];
    category: string;
    paidAt?: string | null;
  };
  checkedInAt?: string | null;
}

