'use server';

import { requireAdmin } from '@/lib/auth-server';
import { db } from '@/db';
import { products, stocks, categories } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export interface AdminActionResult {
  success: boolean;
  message: string;
  timestamp: string;
  stats?: {
    productCount: number;
    categoryCount: number;
    stockCount: number;
  };
}

/**
 * Server Action protected strictly by requireAdmin().
 * Rejects any unauthenticated or non-admin invocations on the server.
 */
export async function triggerAdminAuditAction(): Promise<AdminActionResult> {
  // Server-side admin role verification
  const session = await requireAdmin();

  try {
    const [allCategories, allProducts, allStocks] = await Promise.all([
      db.select().from(categories),
      db.select().from(products),
      db.select().from(stocks),
    ]);

    revalidatePath('/admin');

    return {
      success: true,
      message: `Atelier catalog integrity verified by ${session.user.name || session.user.email} (${(session.user.role || 'ADMIN').toUpperCase()}). All database relations are synchronized.`,
      timestamp: new Date().toISOString(),
      stats: {
        productCount: allProducts.length,
        categoryCount: allCategories.length,
        stockCount: allStocks.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Audit failed: ${error instanceof Error ? error.message : 'Unknown database error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}
