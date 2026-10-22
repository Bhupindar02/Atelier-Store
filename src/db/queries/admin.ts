import { db } from "@/db";
import { products, categories, stocks, orders } from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { PRODUCTS } from "@/data/fashion-data";

const FALLBACK_CATEGORIES = [
  { id: "handbags", slug: "handbags", name: "Leather Goods", description: "Sculptural handbags and leather goods", displayOrder: 1 },
  { id: "tailoring", slug: "tailoring", name: "Tailoring", description: "Architectural silhouettes and structured outerwear", displayOrder: 2 },
  { id: "ready-to-wear", slug: "ready-to-wear", name: "Ready-to-Wear", description: "Modern sartorial essentials and fine silks", displayOrder: 3 },
  { id: "footwear", slug: "footwear", name: "Footwear", description: "Handcrafted Tuscan footwear", displayOrder: 4 },
  { id: "accessories", slug: "accessories", name: "Jewelry & Eyewear", description: "Artisanal accessories and adornments", displayOrder: 5 },
];

function getFallbackQuantity(stockState?: { remaining?: number; status?: string }): number {
  if (!stockState) return 0;
  if (typeof stockState.remaining === "number") return stockState.remaining;
  return stockState.status === "out_of_stock" ? 0 : stockState.status === "low_stock" ? 2 : 12;
}

export interface AdminProductSummary {
  id: string;
  sku: string;
  name: string;
  price: number;
  material: string;
  color: string;
  badge?: string | null;
  primaryImage: string;
  secondaryImage: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  stockQuantity: number;
  stockStatus: string;
  isSpotlight: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCategorySummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  productCount: number;
  createdAt: Date;
}

export interface AdminStockSummary {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage: string;
  price: number;
  quantity: number;
  status: string;
  label: string;
  description: string;
  updatedAt: Date;
}

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerEmail: string;
  customerName: string | null;
  currency: string;
  subtotalCents: number;
  shippingFeeCents: number;
  totalCents: number;
  status: string;
  paymentStatus: string;
  itemsCount: number;
  createdAt: Date;
  updatedAt: Date;
  items?: Array<{
    id: string;
    productName: string;
    sku: string;
    size: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    primaryImage: string;
  }>;
}

export interface AdminCatalogMetrics {
  totalProducts: number;
  totalCategories: number;
  totalStocks: number;
  lowStockCount: number;
  totalOrders: number;
}

/**
 * Retrieves all products with related category and stock data for admin listing.
 */
export async function getAdminProducts(): Promise<AdminProductSummary[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const rows = await db.query.products.findMany({
      orderBy: [desc(products.createdAt)],
      with: {
        category: true,
        stock: true,
      },
    });

    return rows.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      price: p.price,
      material: p.material,
      color: p.color,
      badge: p.badge,
      primaryImage: p.primaryImage,
      secondaryImage: p.secondaryImage,
      categoryId: p.categoryId,
      categoryName: p.category?.name || "Uncategorized",
      categorySlug: p.category?.slug || "all",
      stockQuantity: p.stock?.quantity ?? 0,
      stockStatus: p.stock?.status ?? "out_of_stock",
      isSpotlight: p.isSpotlight,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  } catch (err) {
    console.warn("getAdminProducts fallback:", err);
    // Fallback to static mock products for resilient builds
    return PRODUCTS.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      price: p.price,
      material: p.material,
      color: p.color,
      badge: p.badge,
      primaryImage: p.primaryImage,
      secondaryImage: p.secondaryImage,
      categoryId: p.category,
      categoryName: p.categoryLabel,
      categorySlug: p.category,
      stockQuantity: getFallbackQuantity(p.stockState),
      stockStatus: p.stockState.status,
      isSpotlight: (p as unknown as { isSpotlight?: boolean }).isSpotlight || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
}

/**
 * Retrieves a single product with full category and stock information.
 */
export async function getAdminProductById(id: string) {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const row = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        stock: true,
      },
    });

    return row || null;
  } catch (err) {
    console.warn("getAdminProductById fallback:", err);
    const mock = PRODUCTS.find((p) => p.id === id);
    if (!mock) return null;
    return {
      id: mock.id,
      sku: mock.sku,
      name: mock.name,
      categoryId: mock.category,
      price: mock.price,
      material: mock.material,
      color: mock.color,
      badge: mock.badge || null,
      primaryImage: mock.primaryImage,
      secondaryImage: mock.secondaryImage,
      gallery: mock.gallery,
      description: mock.description,
      origin: mock.origin,
      savoirFaireStory: mock.savoirFaireStory || null,
      details: mock.details,
      sizes: mock.sizes,
      careInstructions: mock.careInstructions,
      isSpotlight: (mock as unknown as { isSpotlight?: boolean }).isSpotlight || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: mock.category,
        name: mock.categoryLabel,
        slug: mock.category,
        description: null,
        displayOrder: 0,
        createdAt: new Date(),
      },
      stock: {
        id: `stock_${mock.id}`,
        productId: mock.id,
        quantity: getFallbackQuantity(mock.stockState),
        status: mock.stockState.status,
        label: mock.stockState.label,
        description: mock.stockState.description,
        updatedAt: new Date(),
      },
    };
  }
}

/**
 * Retrieves all categories with count of assigned products.
 */
export async function getAdminCategories(): Promise<AdminCategorySummary[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const catRows = await db.query.categories.findMany({
      orderBy: [asc(categories.displayOrder), asc(categories.name)],
      with: {
        products: {
          columns: {
            id: true,
          },
        },
      },
    });

    return catRows.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      displayOrder: cat.displayOrder,
      productCount: cat.products?.length ?? 0,
      createdAt: cat.createdAt,
    }));
  } catch (err) {
    console.warn("getAdminCategories fallback:", err);
    return FALLBACK_CATEGORIES.map((cat, idx) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || null,
      displayOrder: idx,
      productCount: PRODUCTS.filter((p) => p.category === cat.slug).length,
      createdAt: new Date(),
    }));
  }
}

/**
 * Retrieves all stocks with associated product details.
 */
export async function getAdminStocks(): Promise<AdminStockSummary[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const rows = await db.query.stocks.findMany({
      with: {
        product: true,
      },
    });

    return rows.map((s) => ({
      id: s.id,
      productId: s.productId,
      productName: s.product?.name || "Unknown Product",
      productSku: s.product?.sku || "SKU-NONE",
      productImage: s.product?.primaryImage || "/images/placeholder.jpg",
      price: s.product?.price || 0,
      quantity: s.quantity,
      status: s.status,
      label: s.label,
      description: s.description,
      updatedAt: s.updatedAt,
    }));
  } catch (err) {
    console.warn("getAdminStocks fallback:", err);
    return PRODUCTS.map((p) => ({
      id: `stock_${p.id}`,
      productId: p.id,
      productName: p.name,
      productSku: p.sku,
      productImage: p.primaryImage,
      price: p.price,
      quantity: getFallbackQuantity(p.stockState),
      status: p.stockState.status,
      label: p.stockState.label,
      description: p.stockState.description,
      updatedAt: new Date(),
    }));
  }
}

/**
 * Retrieves customer orders sorted by creation date descending.
 */
export async function getAdminOrders(limit = 100): Promise<AdminOrderSummary[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const rows = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit,
      with: {
        items: true,
      },
    });

    return rows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      customerEmail: o.customerEmail,
      customerName: o.customerName,
      currency: o.currency,
      subtotalCents: o.subtotalCents,
      shippingFeeCents: o.shippingFeeCents,
      totalCents: o.totalCents,
      status: o.status,
      paymentStatus: o.paymentStatus,
      itemsCount: o.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      items: o.items?.map((it) => ({
        id: it.id,
        productName: it.productSnapshot?.name || "Item",
        sku: it.productSnapshot?.sku || "",
        size: it.size,
        quantity: it.quantity,
        unitPriceCents: it.unitPriceCents,
        lineTotalCents: it.lineTotalCents,
        primaryImage: it.productSnapshot?.primaryImage || "",
      })),
    }));
  } catch (err) {
    console.warn("getAdminOrders fallback:", err);
    return [];
  }
}

/**
 * Retrieves aggregate catalog overview counts.
 */
export async function getAdminMetrics(): Promise<AdminCatalogMetrics> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const [prodRows, catRows, stockRows, orderRows] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ count: sql<number>`count(*)` }).from(categories),
      db.select().from(stocks),
      db.select({ count: sql<number>`count(*)` }).from(orders),
    ]);

    const totalProducts = Number(prodRows[0]?.count ?? 0);
    const totalCategories = Number(catRows[0]?.count ?? 0);
    const totalStocks = stockRows.length;
    const lowStockCount = stockRows.filter(
      (s) => s.status === "low_stock" || s.quantity <= 3
    ).length;
    const totalOrders = Number(orderRows[0]?.count ?? 0);

    return {
      totalProducts,
      totalCategories,
      totalStocks,
      lowStockCount,
      totalOrders,
    };
  } catch (err) {
    console.warn("getAdminMetrics fallback:", err);
    return {
      totalProducts: PRODUCTS.length,
      totalCategories: FALLBACK_CATEGORIES.length,
      totalStocks: PRODUCTS.length,
      lowStockCount: PRODUCTS.filter(
        (p) => p.stockState.status === "low_stock" || getFallbackQuantity(p.stockState) <= 3
      ).length,
      totalOrders: 0,
    };
  }
}
