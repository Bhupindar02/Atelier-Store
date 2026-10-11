'use client';

import React, { useState } from 'react';
import { triggerAdminAuditAction, type AdminActionResult } from '@/app/admin/actions';

export default function AdminActionCockpit() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AdminActionResult | null>(null);

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const res = await triggerAdminAuditAction();
      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Server action rejected authorization.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#181714] border border-[#2b2823] p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[9px] tracking-[0.25em] uppercase font-semibold text-[#d4af6a] block mb-1">
            SERVER ACTION PRIVILEGE TEST
          </span>
          <h3 className="font-serif text-xl font-light text-white">
            Catalog & Inventory Synchronization Audit
          </h3>
          <p className="text-xs text-[#a0978d] font-light mt-1">
            Invokes an admin-gated Server Action (`triggerAdminAuditAction`) validated by `requireAdmin()` on the server runtime.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunAudit}
          disabled={isLoading}
          className="self-start sm:self-auto px-6 py-3 bg-[#d4af6a] text-[#11100e] text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Executing Server Action…' : 'Run Admin Action'}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 border text-xs font-mono transition-all ${
            result.success
              ? 'bg-[#15241b] border-[#2d5a3c] text-[#7ee787]'
              : 'bg-[#291316] border-[#6b2029] text-[#f87171]'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-current/20 mb-2">
            <span className="font-semibold uppercase tracking-wider">
              {result.success ? 'Action Authorized & Executed' : 'Action Rejected'}
            </span>
            <span className="text-[10px] opacity-75">{result.timestamp}</span>
          </div>
          <p className="leading-relaxed font-sans text-xs">{result.message}</p>
          {result.stats && (
            <div className="mt-3 pt-3 border-t border-current/20 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[9px] opacity-75 block">Products</span>
                <span className="text-base font-bold">{result.stats.productCount}</span>
              </div>
              <div>
                <span className="text-[9px] opacity-75 block">Categories</span>
                <span className="text-base font-bold">{result.stats.categoryCount}</span>
              </div>
              <div>
                <span className="text-[9px] opacity-75 block">Stock Records</span>
                <span className="text-base font-bold">{result.stats.stockCount}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
