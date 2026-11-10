import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmPayment, getOrder } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const notification = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
    } = notification;

    if (!order_id) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    // If Midtrans Server Key is configured, verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (serverKey && signature_key) {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex');

      if (signature_key !== expectedSignature) {
        return NextResponse.json({ message: 'Invalid signature key' }, { status: 403 });
      }
    }

    // Midtrans transaction status handling
    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement' ||
      transaction_status === 'success'
    ) {
      confirmPayment(order_id, payment_type || 'MIDTRANS');
    }

    return NextResponse.json({ success: true, message: 'Notification processed' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

