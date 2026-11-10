import { NextResponse } from 'next/server';
import { validateTicketQR } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrPayload } = body;

    if (!qrPayload) {
      return NextResponse.json(
        { status: 'INVALID', message: 'Payload QR Code kosong!' },
        { status: 400 }
      );
    }

    const result = validateTicketQR(qrPayload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { status: 'INVALID', message: (error as Error).message },
      { status: 500 }
    );
  }
}

