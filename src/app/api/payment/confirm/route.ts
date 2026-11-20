import { NextResponse } from 'next/server';
import { confirmPayment } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required.' },
        { status: 400 }
      );
    }

    const result = confirmPayment(orderId, paymentMethod || 'TRANSFER_MANDIRI');
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

