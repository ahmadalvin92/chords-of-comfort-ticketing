import { NextResponse } from 'next/server';
import { getSeats, holdSeats, releaseSeats } from '@/lib/store';

export async function GET() {
  try {
    const seats = getSeats();
    return NextResponse.json({ success: true, seats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seatIds, sessionId } = body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Daftar kursi harus dipilih.' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID tidak valid.' },
        { status: 400 }
      );
    }

    const result = holdSeats(seatIds, sessionId);
    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { seatIds, sessionId } = body;

    if (!seatIds || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap.' },
        { status: 400 }
      );
    }

    const released = releaseSeats(seatIds, sessionId);
    return NextResponse.json({ success: true, released });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

