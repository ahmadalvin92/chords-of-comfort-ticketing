import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, createAdminToken } from '@/lib/adminAuth';

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
    const { email, username, password } = body;
    const userIdentifier = String(email || username || '').trim().toLowerCase();

    if (!userIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/username and password are required.' },
        { status: 400 }
      );
    }

    const cleanPassword = String(password).trim();

    const matchedUser = ADMIN_USERS.find(
      (u) => u.email.toLowerCase() === userIdentifier && u.password === cleanPassword
    );

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password. Please verify your committee credentials.' },
        { status: 401 }
      );
    }

    const token = createAdminToken(matchedUser.email);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role,
        token,
        loggedInAt: new Date().toISOString(),
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
