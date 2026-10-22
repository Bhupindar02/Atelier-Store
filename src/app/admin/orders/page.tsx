import { requireAdmin } from '@/lib/auth-server';
import { getAdminOrders } from '@/db/queries/admin';
import AdminOrdersList from '@/components/admin/AdminOrdersList';

export const instant = false;

export const metadata = {
  title: 'Customer Orders | Atelier Administration',
  description: 'View customer orders, payment status, and fulfillment updates.',
};

export default async function AdminOrdersPage() {
  // Defense-in-depth: explicit server-side admin verification
  await requireAdmin('/admin/orders');

  const ordersList = await getAdminOrders();

  const totalSalesCents = ordersList
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalCents, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2b2823]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#d4af6a] font-semibold">
              FULFILLMENT OVERSIGHT
            </span>
            <span className="text-xs text-[#6b645b]">·</span>
            <span className="text-xs text-[#a0978d] font-mono">
              {ordersList.length} Total Client Orders
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white font-light">
            Customer Orders
          </h1>
          <p className="text-xs text-[#8c8275] mt-1">
            Review acquired orders, verify payment confirmation, and update atelier fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#181714] border border-[#2b2823] px-3 py-2 text-right">
            <span className="text-[9px] uppercase tracking-wider text-[#8c8275] block">
              Paid Volume
            </span>
            <span className="text-base font-serif text-[#d4af6a]">
              ${(totalSalesCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Orders List Component */}
      <AdminOrdersList initialOrders={ordersList} />
    </div>
  );
}
