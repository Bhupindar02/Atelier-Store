import { db } from "@/db";
import { products, categories, stocks } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import {
  Product,
  PRODUCTS,
  SPOTLIGHT_HERO_PRODUCT,
} from "@/data/fashion-data";

// Helper to convert database record to storefront Product shape
export function formatProductRecord(row: {
  id: string;
  name: string;
  categoryId: string;
  sku: string;
  price: number;
  material: string;
  color: string;
  badge?: string | null;
  primaryImage: string;
  secondaryImage: string;
  gallery?: string[] | null;
  description: string;
  origin: string;
  savoirFaireStory?: string | null;
  details?: string[] | null;
  sizes?: string[] | null;
  careInstructions?: string[] | null;
  isSpotlight: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  stock?: {
    status: string;
    quantity: number;
    label: string;
    description: string;
  } | null;
}): Product {
  const stockStatus = (row.stock?.status as any) || "in_stock";

  return {
    id: row.id,
    name: row.name,
    category: (row.category?.slug as any) || (row.categoryId as any),
    categoryLabel: row.category?.name || "Collection",
    price: row.price,
    formattedPrice: `$${row.price.toLocaleString()}`,
    material: row.material,
    color: row.color,
    badge: row.badge ?? undefined,
    primaryImage: row.primaryImage,
    secondaryImage: row.secondaryImage,
    gallery: row.gallery && row.gallery.length > 0 ? row.gallery : [row.primaryImage, row.secondaryImage],
    description: row.description,
    details: row.details || [],
    sizes: row.sizes || [],
    sku: row.sku,
    origin: row.origin,
    stockState: {
      status: stockStatus,
      label: row.stock?.label || "In Stock · Dispatches in 24h",
      description: row.stock?.description || "Complimentary temperature-controlled white-glove courier delivery.",
      remaining: row.stock?.quantity,
    },
    savoirFaireStory: row.savoirFaireStory ?? undefined,
    careInstructions: row.careInstructions || [],
  };
}

export async function getDbProducts(categorySlug?: string): Promise<Product[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const rows = await db.query.products.findMany({
      with: { category: true, stock: true },
      orderBy: [desc(products.createdAt)],
    });

    if (!rows || rows.length === 0) {
      throw new Error("No products found in database");
    }

    const formatted = rows.map(formatProductRecord);
    return categorySlug ? formatted.filter((p) => p.category === categorySlug) : formatted;
  } catch (error) {
    // Graceful fallback to static data
    return categorySlug ? PRODUCTS.filter((p) => p.category === categorySlug) : PRODUCTS;
  }
}

export async function getDbProductById(id: string): Promise<Product | undefined> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const row = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true, stock: true },
    });

    if (row) {
      return formatProductRecord(row);
    }
  } catch {
    // fallback
  }

  return PRODUCTS.find((p) => p.id === id);
}

export async function getDbSpotlightProduct(): Promise<Product> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const row = await db.query.products.findFirst({
      where: eq(products.isSpotlight, true),
      with: { category: true, stock: true },
    });

    if (row) {
      return formatProductRecord(row);
    }
  } catch {
    // fallback
  }

  return SPOTLIGHT_HERO_PRODUCT;
}

export async function getDbCategories() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const rows = await db.query.categories.findMany({
      orderBy: [asc(categories.displayOrder)],
    });

    if (rows && rows.length > 0) {
      return rows;
    }
  } catch {
    // fallback
  }

  return [
    { id: "all", slug: "all", name: "All Creations", displayOrder: 0 },
    { id: "handbags", slug: "handbags", name: "Leather Goods", displayOrder: 1 },
    { id: "tailoring", slug: "tailoring", name: "Tailoring", displayOrder: 2 },
    { id: "ready-to-wear", slug: "ready-to-wear", name: "Ready-to-Wear", displayOrder: 3 },
    { id: "footwear", slug: "footwear", name: "Footwear", displayOrder: 4 },
    { id: "accessories", slug: "accessories", name: "Jewelry & Eyewear", displayOrder: 5 },
  ];
}
