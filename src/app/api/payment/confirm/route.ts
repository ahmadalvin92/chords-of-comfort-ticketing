import { NextResponse } from 'next/server';
import { confirmPayment } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID wajib diisi.' },
        { status: 400 }
      );
    }

    const result = confirmPayment(orderId, paymentMethod || 'QRIS');
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

