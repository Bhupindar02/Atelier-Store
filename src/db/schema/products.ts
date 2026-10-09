import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Categories Table ──────────────────────────────────────
export const categories = pgTable("categories", {
  id: text("id").primaryKey(), // e.g. 'handbags'
  name: text("name").notNull(), // e.g. 'Leather Goods'
  slug: text("slug").notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Products Table ────────────────────────────────────────
export const products = pgTable("products", {
  id: text("id").primaryKey(), // URL-friendly slug, e.g. 'atelier-valmont-tote'
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // stored in dollars (e.g. 3450)
  material: text("material").notNull(),
  color: text("color").notNull(),
  badge: text("badge"),
  primaryImage: text("primary_image").notNull(),
  secondaryImage: text("secondary_image").notNull(),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  description: text("description").notNull(),
  origin: text("origin").notNull().default("Handcrafted in Italy"),
  savoirFaireStory: text("savoir_faire_story"),
  details: jsonb("details").$type<string[]>().notNull().default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  careInstructions: jsonb("care_instructions").$type<string[]>().notNull().default([]),
  isSpotlight: boolean("is_spotlight").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Stock / Inventory Table ───────────────────────────────
export const stocks = pgTable("stocks", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .unique()
    .references(() => products.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("in_stock"), // 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock'
  quantity: integer("quantity").notNull().default(0),
  label: text("label").notNull(),
  description: text("description").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Drizzle Relations ─────────────────────────────────────
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stock: one(stocks, {
    fields: [products.id],
    references: [stocks.productId],
  }),
}));

export const stocksRelations = relations(stocks, ({ one }) => ({
  product: one(products, {
    fields: [stocks.productId],
    references: [products.id],
  }),
}));
