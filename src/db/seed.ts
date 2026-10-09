import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { PRODUCTS, SPOTLIGHT_HERO_PRODUCT } from "../data/fashion-data";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ Cannot seed: DATABASE_URL is not defined in .env or .env.local.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting database seeding...");

  // 1. Categories to seed
  const categoriesToSeed = [
    { id: "handbags", slug: "handbags", name: "Leather Goods", description: "Handcrafted Tuscan leather creations", displayOrder: 1 },
    { id: "tailoring", slug: "tailoring", name: "Tailoring", description: "Sartorial evening & daytime silhouettes", displayOrder: 2 },
    { id: "ready-to-wear", slug: "ready-to-wear", name: "Ready-to-Wear", description: "Fluid silk & structured outerwear", displayOrder: 3 },
    { id: "footwear", slug: "footwear", name: "Footwear", description: "Blake-stitched Italian leather shoes", displayOrder: 4 },
    { id: "accessories", slug: "accessories", name: "Jewelry & Eyewear", description: "Sculpted gold & Japanese cured acetate", displayOrder: 5 },
  ];

  console.log(`📁 Inserting ${categoriesToSeed.length} categories...`);
  for (const cat of categoriesToSeed) {
    await db
      .insert(schema.categories)
      .values(cat)
      .onConflictDoUpdate({
        target: schema.categories.id,
        set: cat,
      });
  }

  // 2. All products including spotlight product
  const allProducts = [...PRODUCTS];
  if (!allProducts.some((p) => p.id === SPOTLIGHT_HERO_PRODUCT.id)) {
    allProducts.push(SPOTLIGHT_HERO_PRODUCT);
  }

  console.log(`🛍️ Inserting ${allProducts.length} products & stock records...`);
  for (const p of allProducts) {
    const isSpotlight = p.id === SPOTLIGHT_HERO_PRODUCT.id;

    // Insert Product
    await db
      .insert(schema.products)
      .values({
        id: p.id,
        categoryId: p.category,
        sku: p.sku,
        name: p.name,
        price: p.price,
        material: p.material,
        color: p.color,
        badge: p.badge || null,
        primaryImage: p.primaryImage,
        secondaryImage: p.secondaryImage,
        gallery: p.gallery || [p.primaryImage, p.secondaryImage],
        description: p.description,
        origin: p.origin,
        savoirFaireStory: p.savoirFaireStory || null,
        details: p.details || [],
        sizes: p.sizes || [],
        careInstructions: p.careInstructions || [],
        isSpotlight,
      })
      .onConflictDoUpdate({
        target: schema.products.id,
        set: {
          name: p.name,
          price: p.price,
          material: p.material,
          color: p.color,
          badge: p.badge || null,
          primaryImage: p.primaryImage,
          secondaryImage: p.secondaryImage,
          gallery: p.gallery || [p.primaryImage, p.secondaryImage],
          description: p.description,
          origin: p.origin,
          savoirFaireStory: p.savoirFaireStory || null,
          details: p.details || [],
          sizes: p.sizes || [],
          careInstructions: p.careInstructions || [],
          isSpotlight,
          updatedAt: new Date(),
        },
      });

    // Insert Stock record (1:1 with product)
    await db
      .insert(schema.stocks)
      .values({
        id: `stock-${p.id}`,
        productId: p.id,
        status: p.stockState.status,
        quantity: p.stockState.remaining ?? 10,
        label: p.stockState.label,
        description: p.stockState.description,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.stocks.productId,
        set: {
          status: p.stockState.status,
          quantity: p.stockState.remaining ?? 10,
          label: p.stockState.label,
          description: p.stockState.description,
          updatedAt: new Date(),
        },
      });
  }

  console.log("✅ Seeding completed successfully!");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
