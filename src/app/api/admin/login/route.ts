import { NextResponse } from 'next/server';

export const ADMIN_USERS = [
  {
    email: 'meovivi@vinsky.com',
    password: 'viona1002',
    name: 'Viona',
    role: 'Lead Ticketing Admin',
  },
  {
    email: 'vinsky@vinsky.com',
    password: 'alvin123',
    name: 'Alvin',
    role: 'Lead Ticketing Admin',
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const matchedUser = ADMIN_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah. Periksa kembali akun panitia Anda.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role,
        loggedInAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
