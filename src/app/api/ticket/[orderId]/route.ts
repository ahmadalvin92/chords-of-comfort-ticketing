import { NextResponse } from 'next/server';
import { getOrder } from '@/lib/store';

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const order = getOrder(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Tiket/Order tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

