import { requireAdmin } from '@/lib/auth-server';
import { getAdminStocks } from '@/db/queries/admin';
import AdminStockTable from '@/components/admin/AdminStockTable';

export const instant = false;

export const metadata = {
  title: 'Inventory & Stock | Atelier Administration',
  description: 'Manage real-time inventory ledger quantities and product availability.',
};

export default async function AdminStockPage() {
  // Defense-in-depth: explicit server-side admin verification
  await requireAdmin('/admin/stock');

  const stockList = await getAdminStocks();

  const totalUnits = stockList.reduce((acc, s) => acc + s.quantity, 0);
  const lowStockCount = stockList.filter(
    (s) => s.status === 'low_stock' || s.quantity <= 3
  ).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2b2823]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#d4af6a] font-semibold">
              INVENTORY MANAGEMENT
            </span>
            <span className="text-xs text-[#6b645b]">·</span>
            <span className="text-xs text-[#a0978d] font-mono">
              {totalUnits} Total Units Across {stockList.length} SKUs
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white font-light">
            Real-Time Stock Ledger
          </h1>
          <p className="text-xs text-[#8c8275] mt-1">
            Maintain strict atelier production allocations and safety stock levels.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#181714] border border-[#2b2823] px-3 py-2 text-right">
            <span className="text-[9px] uppercase tracking-wider text-[#8c8275] block">
              Low Stock Warnings
            </span>
            <span className={`text-base font-serif ${lowStockCount > 0 ? 'text-[#f87171]' : 'text-[#7ee787]'}`}>
              {lowStockCount} SKUs
            </span>
          </div>
        </div>
      </div>

      {/* Stock Table Component */}
      <AdminStockTable initialStocks={stockList} />
    </div>
  );
}
