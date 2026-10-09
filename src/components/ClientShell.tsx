'use client';

import React from 'react';
import { StoreProvider } from '@/context/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductQuickView from '@/components/ProductQuickView';
import SearchModal from '@/components/SearchModal';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-[#faf9f7] text-[#1a1714]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <ProductQuickView />
        <SearchModal />
      </div>
    </StoreProvider>
  );
}
