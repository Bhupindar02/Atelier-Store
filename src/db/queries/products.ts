import { db } from "@/db";
import { products, categories } from "@/db/schema";
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
  const stockStatus = (row.stock?.status as Product["stockState"]["status"]) || "in_stock";

  return {
    id: row.id,
    name: row.name,
    category: (row.category?.slug as Product["category"]) || (row.categoryId as Product["category"]),
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
  const normalizedCategory = categorySlug ? normalizeCategorySlug(categorySlug) : undefined;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const rows = await db.query.products.findMany({
      where: normalizedCategory && normalizedCategory !== "all"
        ? eq(products.categoryId, normalizedCategory)
        : undefined,
      with: { category: true, stock: true },
      orderBy: [desc(products.createdAt)],
    });

    if (!rows || rows.length === 0) {
      throw new Error("No products found in database");
    }

    const formatted = rows.map(formatProductRecord);
    return normalizedCategory && normalizedCategory !== "all"
      ? formatted.filter((p) => p.category === normalizedCategory)
      : formatted;
  } catch {
    // Graceful fallback to static data
    return normalizedCategory && normalizedCategory !== "all"
      ? PRODUCTS.filter((p) => p.category === normalizedCategory)
      : PRODUCTS;
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

export async function getDbNewArrivals(categorySlug?: string, limit?: number): Promise<Product[]> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const rows = await db.query.products.findMany({
      where: categorySlug && categorySlug !== "all" ? eq(products.categoryId, categorySlug) : undefined,
      with: { category: true, stock: true },
      orderBy: [desc(products.createdAt)],
      limit: limit,
    });

    if (!rows || rows.length === 0) {
      throw new Error("No products found in database");
    }

    return rows.map(formatProductRecord);
  } catch {
    const list = categorySlug && categorySlug !== "all"
      ? PRODUCTS.filter((p) => p.category === categorySlug)
      : PRODUCTS;
    return limit ? list.slice(0, limit) : list;
  }
}

export interface CategoryMeta {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  heroImage: string;
  heritage: string;
  seasonTag: string;
  displayOrder: number;
}

export function normalizeCategorySlug(slug: string): string {
  const map: Record<string, string> = {
    maroquinerie: "handbags",
    leather: "handbags",
    sartoriale: "tailoring",
    suits: "tailoring",
    "pret-a-porter": "ready-to-wear",
    rtw: "ready-to-wear",
    shoes: "footwear",
    jewelry: "accessories",
  };
  return map[slug.toLowerCase()] || slug.toLowerCase();
}

export const CATEGORY_METADATA: Record<string, CategoryMeta> = {
  all: {
    id: "all",
    slug: "all",
    name: "The Full Collection",
    subtitle: "Complete Haute Couture & Contemporary Creations",
    description: "Architectural leather volumes, bespoke evening tailoring, and refined accessories crafted across historic European ateliers.",
    heroImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2400&auto=format&fit=crop",
    heritage: "Florence · Biella · Paris",
    seasonTag: "COLLECTIONS ÉDITION 2026",
    displayOrder: 0,
  },
  handbags: {
    id: "handbags",
    slug: "handbags",
    name: "Leather Goods & Maroquinerie",
    subtitle: "Full-Grain Tuscan Calfskin Sculptures",
    description: "Hand-finished saddle stitching, custom 24k gold-dipped lockets, and architectural silhouettes sculpted by Tuscan leather masters.",
    heroImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2400&auto=format&fit=crop",
    heritage: "Scandicci Workshop, Florence",
    seasonTag: "PERMANENT MAROQUINERIE",
    displayOrder: 1,
  },
  tailoring: {
    id: "tailoring",
    slug: "tailoring",
    name: "Sartorial Tailoring & Eveningwear",
    subtitle: "Architectural Suiting & Bespoke Formalwear",
    description: "Structured double-breasted volumes and flowing smoking jackets precision-cut from Super 140s virgin wool and weighted silk faille.",
    heroImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2400&auto=format&fit=crop",
    heritage: "Biella Mills & Milan Tailoring Studio",
    seasonTag: "SARTORIALE ÉDITION",
    displayOrder: 2,
  },
  "ready-to-wear": {
    id: "ready-to-wear",
    slug: "ready-to-wear",
    name: "High Ready-to-Wear & Outerwear",
    subtitle: "Modern Silhouettes in Noble Natural Fibers",
    description: "Fluid silk georgette blouses, double-faced cashmere overcoats, and pleated evening skirts engineered for quiet distinction.",
    heroImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2400&auto=format&fit=crop",
    heritage: "Como Silk Houses & Parisian Ateliers",
    seasonTag: "SPRING / SUMMER 2026",
    displayOrder: 3,
  },
  footwear: {
    id: "footwear",
    slug: "footwear",
    name: "Artisanal Footwear & Calzature",
    subtitle: "Blake-Stitched Italian Leather & Sculpted Heels",
    description: "Hand-burnished calfskin loafers, architectural pointed pumps, and glove-soft leather boots shaped on historic wooden lasts.",
    heroImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2400&auto=format&fit=crop",
    heritage: "Riviera del Brenta, Venice",
    seasonTag: "CALZATURE VENETE",
    displayOrder: 4,
  },
  accessories: {
    id: "accessories",
    slug: "accessories",
    name: "Fine Jewelry & Artisanal Eyewear",
    subtitle: "Sculpted Gold-Vermeil & Cured Japanese Acetates",
    description: "Lost-wax cast jewelry adorned with freshwater baroque pearls, paired with hand-beveled optical frames cured for eight months.",
    heroImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2400&auto=format&fit=crop",
    heritage: "Valenza High Jewelry & Sabae Artisans",
    seasonTag: "OBJETS D'ART & ACCESSOIRES",
    displayOrder: 5,
  },
};

export async function getDbCategoryBySlug(slug: string): Promise<CategoryMeta | undefined> {
  const normalized = normalizeCategorySlug(slug);

  try {
    if (process.env.DATABASE_URL) {
      const row = await db.query.categories.findFirst({
        where: eq(categories.slug, normalized),
      });

      if (row) {
        const meta = CATEGORY_METADATA[row.slug] || CATEGORY_METADATA[normalized];
        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          subtitle: meta?.subtitle || "Contemporary Luxury Collection",
          description: row.description || meta?.description || "Haute couture creations crafted by master artisans.",
          heroImage: meta?.heroImage || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2400&auto=format&fit=crop",
          heritage: meta?.heritage || "European Ateliers",
          seasonTag: meta?.seasonTag || "COLLECTIONS 2026",
          displayOrder: row.displayOrder,
        };
      }
    }
  } catch {
    // fallback
  }

  return CATEGORY_METADATA[normalized] || (normalized === "all" ? CATEGORY_METADATA["all"] : undefined);
}

export async function searchDbProducts(query?: string, categorySlug?: string): Promise<Product[]> {
  const all = await getDbProducts(categorySlug);
  if (!query || query.trim() === '') {
    return all;
  }

  const q = query.trim().toLowerCase();
  return all.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.categoryLabel.toLowerCase().includes(q) ||
    p.material.toLowerCase().includes(q) ||
    p.color.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.origin.toLowerCase().includes(q) ||
    (p.details && p.details.some((d) => d.toLowerCase().includes(q)))
  );
}

