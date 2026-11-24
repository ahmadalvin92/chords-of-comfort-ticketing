import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmPayment } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json(
        { success: false, message: 'Midtrans webhook is not enabled for manual bank transfer mode.' },
        { status: 403 }
      );
    }

    const notification = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
    } = notification;

    if (!order_id || !signature_key) {
      return NextResponse.json(
        { success: false, message: 'Order ID and signature key are required' },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (signature_key !== expectedSignature) {
      return NextResponse.json({ success: false, message: 'Invalid signature key' }, { status: 403 });
    }

    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement' ||
      transaction_status === 'success'
    ) {
      await confirmPayment(order_id, payment_type || 'MIDTRANS');
    }

    return NextResponse.json({ success: true, message: 'Notification processed' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
