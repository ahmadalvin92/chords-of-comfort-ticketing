import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/store';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function POST(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Committee admin session required.' },
      { status: 401 }
    );
  }

  try {
    await resetDatabase();
    return NextResponse.json({ success: true, message: 'Database reset successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
