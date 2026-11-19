import { NextResponse } from 'next/server';
import { getOrder, mergeSupabaseOrders } from '@/lib/store';
import { fetchOrdersFromSupabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    let order = getOrder(orderId);

    // If not found in local memory instance, try fetching from Supabase
    if (!order) {
      try {
        const sbOrders = await fetchOrdersFromSupabase();
        if (sbOrders && sbOrders.length > 0) {
          mergeSupabaseOrders(sbOrders);
          order = getOrder(orderId);
        }
      } catch (err) {
        console.warn('[Ticket API] Supabase fetch fallback:', err);
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Ticket/Order not found.' },
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

