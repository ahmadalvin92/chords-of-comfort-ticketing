import crypto from 'crypto';

const AUTH_SECRET =
  process.env.ADMIN_AUTH_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'chords-of-comfort-comm30-6sp-admin-hmac-secret-2027';

export const ADMIN_COOKIE_NAME = 'chords_admin_token';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface AdminTokenPayload {
  email: string;
  exp: number;
}

/** Sign an authenticated admin session token using HMAC-SHA256. */
export function createAdminToken(email: string): string {
  const payload: AdminTokenPayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

/** Verify a signed token and return the admin email if valid and unexpired. */
export function verifyAdminToken(token: string | undefined | null): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return null;

  try {
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    const providedBuf = Buffer.from(providedSig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (providedBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null;

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as AdminTokenPayload;

    if (!payload?.email || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null;
    }

    return payload.email;
  } catch {
    return null;
  }
}

function parseCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    if (key === name) {
      return decodeURIComponent(pair.slice(idx + 1).trim());
    }
  }
  return null;
}

/** Verify incoming Request via Authorization Bearer token or HttpOnly admin cookie. */
export function verifyAdminRequest(request: Request): { authorized: boolean; email?: string } {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    const email = verifyAdminToken(token);
    if (email) {
      return { authorized: true, email };
    }
  }

  const cookieToken = parseCookieValue(request.headers.get('cookie'), ADMIN_COOKIE_NAME);
  const cookieEmail = verifyAdminToken(cookieToken);
  if (cookieEmail) {
    return { authorized: true, email: cookieEmail };
  }

  return { authorized: false };
}
