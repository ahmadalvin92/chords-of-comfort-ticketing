export type TicketCategory = 'VIP' | 'VIP_BALCONY' | 'REGULAR';

export type SeatStatus = 'available' | 'held' | 'sold';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface Seat {
  id: string; // e.g. "MF-A-15", "BAL-AA-12"
  label: string; // e.g. "A-15", "AA-12"
  section: 'MAIN_FLOOR' | 'BALCONY';
  row: string; // "A".."H" or "AA", "AB", "AC"
  number: number;
  block?: 'LEFT' | 'CENTER' | 'RIGHT';
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
