export const instant = false;

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-server';

/**
 * Root Admin route segment.
 * Verifies admin role on the server before redirecting to the Products Catalog.
 */
export default async function AdminRootPage() {
  await requireAdmin('/admin');
  redirect('/admin/products');
}
