import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, seatIds, sessionId, paymentMethod } = body;

    if (!customer?.fullName || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { success: false, error: 'Data pemesan tidak lengkap (Nama, Email, dan No HP wajib diisi).' },
        { status: 400 }
      );
    }

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Silakan pilih minimal 1 kursi.' },
        { status: 400 }
      );
    }

    const orderResult = createOrder(customer, seatIds, sessionId, paymentMethod || 'QRIS');

    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json(orderResult, { status: 409 });
    }

    const order = orderResult.order;

    // Check if Midtrans Server Key is configured in environment
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
            first_name: customer.fullName,
            email: customer.email,
            phone: customer.phone,
          },
          item_details: order.items.map((item) => ({
            id: item.seatId,
            price: item.price,
            quantity: 1,
            name: `Tiket ${item.category} (${item.seatLabel})`,
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
        console.warn('Midtrans Snap request failed, falling back to simulated checkout:', err);
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

