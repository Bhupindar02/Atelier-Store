import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, type Session } from '@/lib/auth';

/**
 * Retrieves the current authenticated user session on the server.
 * Returns null if the request is unauthenticated.
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

/**
 * Guards routes requiring a signed-in customer.
 * Redirects unauthenticated requests to the sign-in page.
 */
export async function requireAuth(callbackUrl = '/account'): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

/**
 * Guards routes requiring the admin role.
 * Redirects unauthenticated users to sign-in and unauthorized customers to /account with an error message.
 */
export async function requireAdmin(callbackUrl = '/admin'): Promise<Session> {
  const session = await requireAuth(callbackUrl);
  if (session.user.role !== 'admin') {
    redirect('/account?error=unauthorized_admin');
  }
  return session;
}
