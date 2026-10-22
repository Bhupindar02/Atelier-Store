import { Suspense } from 'react';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-server';
import AdminNav from '@/components/admin/AdminNav';

export const instant = false;

export const metadata: Metadata = {
  title: 'Atelier Administration Console | Maison Atelier',
  description: 'Maison Atelier executive administration console and catalog inventory oversight.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Mandatory server-side admin role verification
  // Any unauthenticated request redirects to /auth/sign-in
  // Any authenticated non-admin request redirects to /account?error=unauthorized_admin
  const session = await requireAdmin('/admin');

  return (
    <div className="min-h-screen bg-[#100f0c] text-[#f5f2eb] antialiased flex flex-col font-sans selection:bg-[#d4af6a]/30 selection:text-[#f5f2eb]">
      <AdminNav user={session.user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[#d4af6a] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs uppercase tracking-[0.25em] text-[#a0978d]">
                Synchronizing Atelier Console…
              </p>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>

      <footer className="border-t border-[#2b2823] bg-[#141310] py-6 text-center text-[10px] text-[#6b645b] uppercase tracking-[0.2em]">
        Maison Atelier Haute Maroquinerie · Secure Admin Gateway
      </footer>
    </div>
  );
}
