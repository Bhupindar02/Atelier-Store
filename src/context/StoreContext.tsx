'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product, PRODUCTS } from '@/data/fashion-data';
import type { CartValidationResponse, ValidatedCartItemOutput, StockStatusType } from '@/app/api/cart/validate/route';

export interface CartItem {
  productId: string;
  product: Product;
  size?: string;
  quantity: number;
  maxAvailable: number;
  stockStatus: StockStatusType;
  warning?: string;
}

export interface StoredCartTuple {
  productId: string;
  size?: string;
  quantity: number;
}

interface AddToCartResult {
  success: boolean;
  message?: string;
  clamped?: boolean;
}

interface StoreContextType {
  cart: CartItem[];
  wishlistIds: string[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: Product | null;
  cartCount: number;
  cartTotal: number;
  cartWarnings: string[];
  isValidatingCart: boolean;
  addToCart: (product: Product, size?: string, quantity?: number) => AddToCartResult;
  updateQuantity: (productId: string, size: string | undefined, newQuantity: number) => void;
  removeFromCart: (productId: string, size?: string) => void;
  clearCart: () => void;
  getItemQuantityInCart: (productId: string, size?: string) => number;
  getMaxAvailable: (productId: string, defaultStock?: number) => number;
  refreshCartValidation: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'atelier_cart_v2';
const LEGACY_STORAGE_KEY = 'atelier_cart';
const WISHLIST_STORAGE_KEY = 'atelier_wishlist';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [cartWarnings, setCartWarnings] = useState<string[]>([]);
  const [isValidatingCart, setIsValidatingCart] = useState(false);

  // Guard against re-entrant saves during hydration
  const isHydratedRef = useRef(false);

  // Helper to persist only minimal tuples to localStorage (no arbitrary client prices)
  const persistCartTuples = (currentCart: CartItem[]) => {
    try {
      const tuples: StoredCartTuple[] = currentCart.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(tuples));
    } catch {
      // storage unavailable / fallback
    }
  };

  // Server-side Cart Validation & Authoritative Price/Stock Synchronization
  const validateCartWithServer = useCallback(async (tuplesToValidate: StoredCartTuple[]) => {
    if (tuplesToValidate.length === 0) {
      setCart([]);
      setCartWarnings([]);
      return;
    }

    setIsValidatingCart(true);

    try {
      const response = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: tuplesToValidate }),
      });

      if (!response.ok) {
        throw new Error('Validation response not ok');
      }

      const data: CartValidationResponse = await response.json();

      if (data.success && Array.isArray(data.items)) {
        // Build updated CartItem[] using authoritative product data and current prices
        const enrichedItems: CartItem[] = data.items
          .filter((vItem) => vItem.validatedQuantity > 0)
          .map((vItem: ValidatedCartItemOutput) => {
            // Find base product or synthesize from authoritative response
            const baseProduct = PRODUCTS.find((p) => p.id === vItem.productId);

            const fallbackStockStateStatus: Product['stockState']['status'] =
              vItem.stockStatus === 'out_of_stock' ? 'low_stock' : vItem.stockStatus;

            const syncedProduct: Product = baseProduct
              ? {
                  ...baseProduct,
                  price: vItem.currentPrice,
                  formattedPrice: vItem.formattedPrice,
                  stockState: {
                    ...baseProduct.stockState,
                    status: fallbackStockStateStatus,
                    remaining: vItem.maxAvailable,
                  },
                }
              : {
                  id: vItem.productId,
                  name: vItem.product.name,
                  category: 'handbags',
                  categoryLabel: vItem.product.categoryLabel,
                  price: vItem.currentPrice,
                  formattedPrice: vItem.formattedPrice,
                  material: vItem.product.material,
                  color: vItem.product.color,
                  primaryImage: vItem.product.primaryImage,
                  secondaryImage: vItem.product.primaryImage,
                  gallery: [vItem.product.primaryImage],
                  description: '',
                  details: [],
                  sizes: vItem.size ? [vItem.size] : ['One Size'],
                  sku: vItem.product.sku,
                  origin: 'Handcrafted in Italy',
                  stockState: {
                    status: fallbackStockStateStatus,
                    label: `${vItem.maxAvailable} Available`,
                    description: '',
                    remaining: vItem.maxAvailable,
                  },
                };

            return {
              productId: vItem.productId,
              product: syncedProduct,
              size: vItem.size,
              quantity: vItem.validatedQuantity,
              maxAvailable: vItem.maxAvailable,
              stockStatus: vItem.stockStatus,
              warning: vItem.warning,
            };
          });

        setCart(enrichedItems);
        setCartWarnings(data.warnings || []);
        persistCartTuples(enrichedItems);
      }
    } catch (err) {
      console.warn('Cart server-side validation fallback to local data:', err);
    } finally {
      setIsValidatingCart(false);
    }
  }, []);

  // Hydration Effect: Load stored cart on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        let loadedTuples: StoredCartTuple[] = [];

        // Try v2 storage format first
        const savedV2 = localStorage.getItem(CART_STORAGE_KEY);
        if (savedV2) {
          loadedTuples = JSON.parse(savedV2);
        } else {
          // Backward compatibility: migrate legacy full-product cart format
          const legacyCart = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacyCart) {
            const parsedLegacy = JSON.parse(legacyCart);
            if (Array.isArray(parsedLegacy)) {
              loadedTuples = parsedLegacy
                .map((item: { product?: { id: string }; size?: string; quantity?: number }) => ({
                  productId: item.product?.id || '',
                  size: item.size,
                  quantity: item.quantity || 1,
                }))
                .filter((t: StoredCartTuple) => Boolean(t.productId));
            }
          }
        }

        const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (savedWishlist) setWishlistIds(JSON.parse(savedWishlist));

        if (loadedTuples.length > 0) {
          // Temporary optimistic hydration from fashion-data while server validates
          const optimisticCart: CartItem[] = loadedTuples
            .map((tuple) => {
              const p = PRODUCTS.find((prod) => prod.id === tuple.productId);
              const max = p?.stockState.remaining ?? 5;
              const stockStatus: StockStatusType = max <= 0 ? 'out_of_stock' : (p?.stockState.status ?? 'in_stock');
              return {
                productId: tuple.productId,
                product: p || {
                  id: tuple.productId,
                  name: 'Atelier Creation',
                  category: 'handbags',
                  categoryLabel: 'Collection',
                  price: 0,
                  formattedPrice: '$0',
                  material: '',
                  color: '',
                  primaryImage: '/images/placeholder.jpg',
                  secondaryImage: '/images/placeholder.jpg',
                  gallery: [],
                  description: '',
                  details: [],
                  sizes: [],
                  sku: '',
                  origin: '',
                  stockState: { status: 'in_stock', label: '', description: '', remaining: 5 },
                },
                size: tuple.size || 'One Size',
                quantity: Math.min(tuple.quantity, max),
                maxAvailable: max,
                stockStatus,
              };
            })
            .filter((item) => Boolean(item.product.id));

          setCart(optimisticCart);

          // Validate immediately with server
          validateCartWithServer(loadedTuples);
        }

        isHydratedRef.current = true;
      } catch {
        isHydratedRef.current = true;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [validateCartWithServer]);

  // Wishlist persistence
  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage fallback
      }
      return next;
    });
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  // Helper to query item quantity already in cart
  const getItemQuantityInCart = (productId: string, size?: string) => {
    const found = cart.find(
      (item) => item.productId === productId && (!size || item.size === size)
    );
    return found ? found.quantity : 0;
  };

  // Helper to get max available stock for a product
  const getMaxAvailable = (productId: string, defaultStock?: number) => {
    const inCartItem = cart.find((i) => i.productId === productId);
    if (inCartItem) return inCartItem.maxAvailable;
    if (typeof defaultStock === 'number') return defaultStock;
    const prod = PRODUCTS.find((p) => p.id === productId);
    return prod?.stockState.remaining ?? 5;
  };

  // Add To Cart with Stock Enforcement
  const addToCart = (
    product: Product,
    size?: string,
    requestedQuantity: number = 1
  ): AddToCartResult => {
    const chosenSize = size || (product.sizes?.[0] ?? 'One Size');
    const isMadeToOrder = product.stockState?.status === 'made_to_order';
    const maxStock = typeof product.stockState?.remaining === 'number'
      ? (isMadeToOrder && product.stockState.remaining === 0 ? 5 : product.stockState.remaining)
      : 5;

    // Check if item is out of stock completely
    if (!isMadeToOrder && maxStock <= 0) {
      return {
        success: false,
        message: `${product.name} is currently out of stock in the Atelier archive.`,
      };
    }

    let resultStatus: AddToCartResult = { success: true };

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.size === chosenSize
      );

      let nextCart: CartItem[];

      if (existing) {
        const potentialQty = existing.quantity + requestedQuantity;
        const finalQty = Math.min(potentialQty, maxStock);

        if (existing.quantity >= maxStock) {
          resultStatus = {
            success: false,
            message: `Your bag already holds the maximum available allocation (${maxStock}) for this creation.`,
            clamped: true,
          };
          return prev;
        }

        if (potentialQty > maxStock) {
          resultStatus = {
            success: true,
            message: `Quantity adjusted to ${finalQty} (maximum available atelier inventory).`,
            clamped: true,
          };
        }

        nextCart = prev.map((item) =>
          item.productId === product.id && item.size === chosenSize
            ? { ...item, quantity: finalQty, maxAvailable: maxStock }
            : item
        );
      } else {
        const finalQty = Math.min(requestedQuantity, maxStock);
        if (requestedQuantity > maxStock) {
          resultStatus = {
            success: true,
            message: `Quantity set to ${finalQty} (maximum available atelier inventory).`,
            clamped: true,
          };
        }
        nextCart = [
          ...prev,
          {
            productId: product.id,
            product,
            size: chosenSize,
            quantity: finalQty,
            maxAvailable: maxStock,
            stockStatus: product.stockState.status,
          },
        ];
      }

      persistCartTuples(nextCart);
      return nextCart;
    });

    setIsCartOpen(true);
    return resultStatus;
  };

  // Update Quantity with Stepper Clamping
  const updateQuantity = (
    productId: string,
    size: string | undefined,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((prev) => {
      const nextCart = prev.map((item) => {
        if (item.productId === productId && (!size || item.size === size)) {
          const clamped = Math.min(newQuantity, item.maxAvailable);
          return {
            ...item,
            quantity: clamped,
            warning: clamped < newQuantity
              ? `Only ${item.maxAvailable} pieces available in inventory.`
              : undefined,
          };
        }
        return item;
      });

      persistCartTuples(nextCart);
      return nextCart;
    });
  };

  // Remove Item from Cart
  const removeFromCart = (productId: string, size?: string) => {
    setCart((prev) => {
      const nextCart = prev.filter(
        (item) => !(item.productId === productId && (!size || item.size === size))
      );
      persistCartTuples(nextCart);
      return nextCart;
    });
  };

  // Clear Entire Cart
  const clearCart = () => {
    setCart([]);
    setCartWarnings([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // storage fallback
    }
  };

  // Refresh cart validation from server
  const refreshCartValidation = async () => {
    const tuples: StoredCartTuple[] = cart.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
    }));
    await validateCartWithServer(tuples);
  };

  // Authoritative computations using current product prices
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlistIds,
        isCartOpen,
        isSearchOpen,
        quickViewProduct,
        cartCount,
        cartTotal,
        cartWarnings,
        isValidatingCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantityInCart,
        getMaxAvailable,
        refreshCartValidation,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        openQuickView: (product) => setQuickViewProduct(product),
        closeQuickView: () => setQuickViewProduct(null),
        toggleWishlist,
        isInWishlist,
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
