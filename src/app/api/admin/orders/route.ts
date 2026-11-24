import { NextResponse } from 'next/server';
import { getAllOrders, getSeats } from '@/lib/store';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { TicketCategory } from '@/types/ticket';

export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please sign in to the committee dashboard.' },
      { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }

  try {
    const [orders, seats] = await Promise.all([getAllOrders(), getSeats()]);

    const totalCapacity = seats.length;
    const soldSeats = seats.filter((s) => s.status === 'sold').length;
    const heldSeats = seats.filter((s) => s.status === 'held').length;
    const availableSeats = seats.filter((s) => s.status === 'available').length;

    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const categoryStats: Record<
      TicketCategory,
      { total: number; sold: number; available: number; revenue: number }
    > = {
      VIP: { total: 0, sold: 0, available: 0, revenue: 0 },
      VIP_BALCONY: { total: 0, sold: 0, available: 0, revenue: 0 },
      REGULAR: { total: 0, sold: 0, available: 0, revenue: 0 },
    };

    seats.forEach((seat) => {
      categoryStats[seat.category].total += 1;
      if (seat.status === 'sold') {
        categoryStats[seat.category].sold += 1;
        categoryStats[seat.category].revenue += seat.price;
      } else if (seat.status === 'available') {
        categoryStats[seat.category].available += 1;
      }
    });

    const checkIns = orders.flatMap((o) =>
      o.items.filter((item) => item.isCheckedIn)
    ).length;

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalCapacity,
          soldSeats,
          heldSeats,
          availableSeats,
          totalOrders: orders.length,
          paidOrdersCount: paidOrders.length,
          totalRevenue,
          totalCheckIns: checkIns,
          categoryStats,
        },
        orders,
        seats,
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
