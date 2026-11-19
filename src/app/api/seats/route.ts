import { NextResponse } from 'next/server';
import { getSeats, holdSeats, releaseSeats, mergeSupabaseSeats } from '@/lib/store';
import { fetchSeatsFromSupabase, syncAllSeatsToSupabase, updateSeatsStatusInSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    try {
      const sbSeats = await fetchSeatsFromSupabase();
      if (sbSeats && sbSeats.length > 0) {
        mergeSupabaseSeats(sbSeats);
      } else {
        // Auto-seed to Supabase when table is ready
        const localSeats = getSeats();
        syncAllSeatsToSupabase(localSeats).catch(() => {});
      }
    } catch (err) {
      console.warn('[Seats API] Supabase sync fallback:', err);
    }

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
        { success: false, error: 'At least one seat must be selected.' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Invalid session ID.' },
        { status: 400 }
      );
    }

    const result = holdSeats(seatIds, sessionId);
    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    // Sync held seats to Supabase
    updateSeatsStatusInSupabase(seatIds, 'held', sessionId, Date.now() + 10 * 60 * 1000).catch(() => {});

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
        { success: false, error: 'Incomplete data.' },
        { status: 400 }
      );
    }

    const released = releaseSeats(seatIds, sessionId);
    if (released) {
      // Sync release to Supabase
      updateSeatsStatusInSupabase(seatIds, 'available', null, null, null).catch(() => {});
    }

    return NextResponse.json({ success: true, released });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

