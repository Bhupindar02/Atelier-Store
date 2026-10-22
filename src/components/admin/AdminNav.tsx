'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';

interface AdminNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      label: 'Products Catalog',
      href: '/admin/products',
      isActive: pathname === '/admin/products' || pathname.startsWith('/admin/products/'),
    },
    {
      label: 'Inventory & Stock',
      href: '/admin/stock',
      isActive: pathname === '/admin/stock',
    },
    {
      label: 'Taxonomy Categories',
      href: '/admin/categories',
      isActive: pathname === '/admin/categories',
    },
    {
      label: 'Customer Orders',
      href: '/admin/orders',
      isActive: pathname === '/admin/orders',
    },
  ];

  return (
    <header className="border-b border-[#2b2823] bg-[#141310] text-[#f5f2eb] sticky top-0 z-40 backdrop-blur-md bg-[#141310]/95">
      {/* Top Bar: Brand, Session & Quick Exit */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-[#2b2823]/60">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="group flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d4af6a] animate-pulse" />
              <span className="font-serif tracking-[0.25em] text-sm uppercase text-white font-medium group-hover:text-[#d4af6a] transition-colors">
                MAISON ATELIER
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#a0978d] font-sans pl-1">
                / Admin Console
              </span>
            </Link>

            <span className="inline-flex items-center text-[8px] tracking-[0.2em] uppercase px-2 py-0.5 bg-[#d4af6a]/10 border border-[#d4af6a]/30 text-[#d4af6a] font-mono">
              ROLE: {(user.role || 'ADMIN').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:block text-right pr-2">
              <p className="text-[11px] text-white font-medium">{user.name || 'Administrator'}</p>
              <p className="text-[9px] text-[#8c8275]">{user.email}</p>
            </div>

            <Link
              href="/"
              className="px-3 py-1.5 border border-[#3a3530] text-[#a0978d] hover:text-white hover:border-[#a0978d] text-[9px] uppercase tracking-[0.2em] transition-colors"
            >
              Storefront
            </Link>
            <Link
              href="/account"
              className="px-3 py-1.5 border border-[#3a3530] text-[#a0978d] hover:text-white hover:border-[#a0978d] text-[9px] uppercase tracking-[0.2em] transition-colors"
            >
              Account
            </Link>
            <SignOutButton
              className="px-3 py-1.5 bg-[#a11826] hover:bg-[#80131e] text-white text-[9px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto py-3 no-scrollbar" aria-label="Admin Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all relative ${
                link.isActive
                  ? 'text-[#d4af6a] font-medium bg-[#d4af6a]/10 border border-[#d4af6a]/30'
                  : 'text-[#a0978d] hover:text-white hover:bg-[#1f1d18]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
