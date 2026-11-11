import { NextResponse } from 'next/server';
import {
  confirmPayment,
  manualToggleCheckIn,
  deleteOrder,
  manualCreateOrder,
} from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, orderId, paymentMethod, customer, seatIds, isPaid } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Aksi tidak valid.' }, { status: 400 });
    }

    if (action === 'mark_paid') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'Order ID wajib diisi.' }, { status: 400 });
      }
      const res = confirmPayment(orderId, paymentMethod || 'MANUAL_CONFIRMED');
      return NextResponse.json(res);
    }

    if (action === 'toggle_checkin') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'Order ID wajib diisi.' }, { status: 400 });
      }
      const res = manualToggleCheckIn(orderId);
      return NextResponse.json(res);
    }

    if (action === 'delete_order') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'Order ID wajib diisi.' }, { status: 400 });
      }
      const res = deleteOrder(orderId);
      return NextResponse.json(res);
    }

    if (action === 'manual_create') {
      if (!customer?.fullName || !seatIds || seatIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Nama dan kursi wajib dipilih.' },
          { status: 400 }
        );
      }
      const res = manualCreateOrder(customer, seatIds, paymentMethod || 'INVITATION_VIP', isPaid ?? true);
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
