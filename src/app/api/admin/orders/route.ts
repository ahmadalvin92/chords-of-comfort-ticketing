import { NextResponse } from 'next/server';
import { getAllOrders, getSeats } from '@/lib/store';
import { CATEGORY_INFO } from '@/data/initialSeats';
import { TicketCategory } from '@/types/ticket';

export async function GET() {
  try {
    const orders = getAllOrders();
    const seats = getSeats();

    // Calculate statistics
    const totalCapacity = seats.length;
    const soldSeats = seats.filter((s) => s.status === 'sold').length;
    const heldSeats = seats.filter((s) => s.status === 'held').length;
    const availableSeats = seats.filter((s) => s.status === 'available').length;

    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Sales by Category
    const categoryStats: Record<
      TicketCategory,
      { total: number; sold: number; available: number; revenue: number }
    > = {
      VIP: { total: 0, sold: 0, available: 0, revenue: 0 },
      SAPPHIRE: { total: 0, sold: 0, available: 0, revenue: 0 },
      DIAMOND: { total: 0, sold: 0, available: 0, revenue: 0 },
      PLATINUM: { total: 0, sold: 0, available: 0, revenue: 0 },
      RUBY: { total: 0, sold: 0, available: 0, revenue: 0 },
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

    return NextResponse.json({
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
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

