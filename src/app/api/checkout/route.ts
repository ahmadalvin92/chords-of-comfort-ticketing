import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/store';

const SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{3,64}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, seatIds, sessionId, paymentMethod } = body;

    const fullName = typeof customer?.fullName === 'string' ? customer.fullName.trim() : '';
    const email = typeof customer?.email === 'string' ? customer.email.trim() : '';
    const phone = typeof customer?.phone === 'string' ? customer.phone.trim() : '';
    const notes = typeof customer?.notes === 'string' ? customer.notes.trim() : undefined;

    if (fullName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide your full name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 8 || phoneDigits.length > 16) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid WhatsApp phone number (8-16 digits).' },
        { status: 400 }
      );
    }

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0 || seatIds.length > 6) {
      return NextResponse.json(
        { success: false, error: 'Please select between 1 and 6 seats.' },
        { status: 400 }
      );
    }

    const safeSessionId =
      typeof sessionId === 'string' && SESSION_ID_REGEX.test(sessionId)
        ? sessionId
        : 'sess_checkout';

    const orderResult = await createOrder(
      { fullName, email, phone, notes },
      seatIds,
      safeSessionId,
      paymentMethod || 'TRANSFER_MANDIRI'
    );

    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json(orderResult, { status: 409 });
    }

    const order = orderResult.order;

    // Optional Midtrans Snap Token generation if configured
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    let snapToken: string | undefined = undefined;

    if (midtransServerKey) {
      try {
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        const snapEndpoint = isProduction
          ? 'https://app.midtrans.com/snap/v1/transactions'
          : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const authHeader = `Basic ${Buffer.from(`${midtransServerKey}:`).toString('base64')}`;

        const payload = {
          transaction_details: {
            order_id: order.id,
            gross_amount: order.totalAmount,
          },
          customer_details: {
            first_name: fullName,
            email,
            phone,
          },
          item_details: order.items.map((item) => ({
            id: item.seatId,
            price: item.price,
            quantity: 1,
            name: `Ticket ${item.category} (${item.seatLabel})`,
          })),
        };

        const res = await fetch(snapEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const snapData = await res.json();
          snapToken = snapData.token;
          order.snapToken = snapToken;
        }
      } catch (err) {
        console.warn('Midtrans Snap request failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      order,
      snapToken,
      hasLiveMidtrans: Boolean(midtransServerKey && snapToken),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
