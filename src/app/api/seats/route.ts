import { NextResponse } from 'next/server';
import { getSeats, holdSeats, releaseSeats } from '@/lib/store';

const SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{3,64}$/;

export async function GET() {
  try {
    const seats = await getSeats();
    return NextResponse.json(
      { success: true, seats },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
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
        { success: false, error: 'At least one seat must be selected.' },
        { status: 400 }
      );
    }

    if (typeof sessionId !== 'string' || !SESSION_ID_REGEX.test(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid session ID.' },
        { status: 400 }
      );
    }

    const result = await holdSeats(seatIds, sessionId);
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

    if (!Array.isArray(seatIds) || seatIds.length === 0 || typeof sessionId !== 'string' || !SESSION_ID_REGEX.test(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Incomplete or invalid release parameters.' },
        { status: 400 }
      );
    }

    const released = await releaseSeats(seatIds, sessionId);
    return NextResponse.json({ success: true, released });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
