import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/store';

export async function POST() {
  try {
    resetDatabase();
    return NextResponse.json({ success: true, message: 'Database reset successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

