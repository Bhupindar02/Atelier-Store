'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/fashion-data';

export interface CartItem {
  product: Product;
  size?: string;
  quantity: number;
}

interface StoreContextType {
  cart: CartItem[];
  wishlistIds: string[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: Product | null;
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  cartCount: number;
  cartTotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Load initial demo items or local state gracefully
  useEffect(() => {
    // Default 1 demo item in bag to show off luxury presentation if desired
    try {
      const savedCart = localStorage.getItem('atelier_cart');
      const savedWishlist = localStorage.getItem('atelier_wishlist');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlistIds(JSON.parse(savedWishlist));
    } catch {
      // storage unavailable / fallback
    }
  }, []);

  const addToCart = (product: Product, size?: string) => {
    setCart((prev) => {
      const chosenSize = size || (product.sizes ? product.sizes[0] : 'One Size');
      const existing = prev.find(
        (item) => item.product.id === product.id && item.size === chosenSize
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === chosenSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size: chosenSize, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && (!size || item.size === size)))
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlistIds,
        isCartOpen,
        isSearchOpen,
        quickViewProduct,
        addToCart,
        removeFromCart,
        toggleWishlist,
        isInWishlist,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        openQuickView: (product) => setQuickViewProduct(product),
        closeQuickView: () => setQuickViewProduct(null),
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
