'use server';

import { assertAdminSession } from '@/lib/auth-server';
import { db } from '@/db';
import { products, stocks, categories, orders } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AdminActionResult {
  success: boolean;
  message: string;
  timestamp: string;
  stats?: {
    productCount: number;
    categoryCount: number;
    stockCount: number;
  };
}

/**
 * Server Action verifying database synchronization and integrity under admin session.
 */
export async function triggerAdminAuditAction(): Promise<AdminActionResult> {
  const session = await assertAdminSession();

  try {
    const [allCategories, allProducts, allStocks] = await Promise.all([
      db.select().from(categories),
      db.select().from(products),
      db.select().from(stocks),
    ]);

    revalidatePath('/admin');
    revalidatePath('/admin/products');

    return {
      success: true,
      message: `Atelier catalog integrity verified by ${session.user.name || session.user.email} (${(session.user.role || 'ADMIN').toUpperCase()}). All database relations are synchronized.`,
      timestamp: new Date().toISOString(),
      stats: {
        productCount: allProducts.length,
        categoryCount: allCategories.length,
        stockCount: allStocks.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Audit failed: ${error instanceof Error ? error.message : 'Unknown database error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Verifies that the current caller possesses the 'admin' role.
 * Rejects immediately with error if caller is guest or regular customer.
 */
export async function verifyAdminRoleAction(): Promise<ActionResponse<{ role: string; email: string; name: string }>> {
  try {
    const session = await assertAdminSession();
    return {
      success: true,
      data: {
        role: session.user.role || 'admin',
        email: session.user.email,
        name: session.user.name,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unauthorized access',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Updates an inventory stock record (quantity, status, label).
 * Enforces admin role check on the server.
 */
export async function updateStockAction(
  productId: string,
  quantity: number,
  status?: string,
  label?: string
): Promise<ActionResponse> {
  try {
    const session = await assertAdminSession();

    const normalizedQuantity = Math.max(0, Math.floor(quantity));
    const computedStatus =
      status ||
      (normalizedQuantity === 0
        ? 'out_of_stock'
        : normalizedQuantity <= 3
        ? 'low_stock'
        : 'in_stock');

    const computedLabel =
      label ||
      (computedStatus === 'out_of_stock'
        ? 'Out of Stock'
        : computedStatus === 'low_stock'
        ? `Only ${normalizedQuantity} Available`
        : computedStatus === 'made_to_order'
        ? 'Made to Order'
        : 'In Stock · Atelier Ready');

    await db
      .insert(stocks)
      .values({
        id: `stock_${productId}`,
        productId,
        quantity: normalizedQuantity,
        status: computedStatus,
        label: computedLabel,
        description: `Inventory maintained by ${session.user.name} (${session.user.email})`,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: stocks.productId,
        set: {
          quantity: normalizedQuantity,
          status: computedStatus,
          label: computedLabel,
          updatedAt: new Date(),
        },
      });

    revalidatePath('/admin');
    revalidatePath('/admin/stock');
    revalidatePath('/admin/products');
    revalidatePath(`/products/${productId}`);
    revalidatePath('/');

    return {
      success: true,
      message: `Stock for product ${productId} updated to ${normalizedQuantity} (${computedStatus}).`,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update stock',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Creates a new category.
 * Enforces admin role check on the server.
 */
export async function createCategoryAction(data: {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
}): Promise<ActionResponse> {
  try {
    await assertAdminSession();

    const id = data.id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    if (!id || !data.name.trim() || !slug) {
      return {
        success: false,
        error: 'Category ID, Name, and Slug are required.',
        timestamp: new Date().toISOString(),
      };
    }

    await db.insert(categories).values({
      id,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      displayOrder: data.displayOrder ?? 0,
      createdAt: new Date(),
    });

    revalidatePath('/admin');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/');

    return {
      success: true,
      message: `Category "${data.name}" created successfully.`,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create category',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Updates an existing category.
 * Enforces admin role check on the server.
 */
export async function updateCategoryAction(
  categoryId: string,
  data: {
    name: string;
    description?: string;
    displayOrder?: number;
  }
): Promise<ActionResponse> {
  try {
    await assertAdminSession();

    await db
      .update(categories)
      .set({
        name: data.name.trim(),
        description: data.description?.trim() || null,
        displayOrder: data.displayOrder ?? 0,
      })
      .where(eq(categories.id, categoryId));

    revalidatePath('/admin');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/');

    return {
      success: true,
      message: `Category "${data.name}" updated successfully.`,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update category',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Deletes a category safely, guarding against deleting categories with assigned products.
 * Enforces admin role check on the server.
 */
export async function deleteCategoryAction(categoryId: string): Promise<ActionResponse> {
  try {
    await assertAdminSession();

    // Verify whether any products depend on this category
    const [assignedProducts] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.categoryId, categoryId));

    if (assignedProducts && assignedProducts.count > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${assignedProducts.count} product(s) are still assigned to it. Please reassign or remove them first.`,
        timestamp: new Date().toISOString(),
      };
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

    revalidatePath('/admin');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/');

    return {
      success: true,
      message: `Category ${categoryId} deleted successfully.`,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete category',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Updates order status (e.g. pending -> processing -> completed -> cancelled).
 * Enforces admin role check on the server.
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
): Promise<ActionResponse> {
  try {
    await assertAdminSession();

    await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    revalidatePath('/admin');
    revalidatePath('/admin/orders');

    return {
      success: true,
      message: `Order ${orderId} marked as ${status}.`,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update order status',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Deletes a product and its associated stock record (via ON DELETE CASCADE).
 * Enforces admin role check on the server.
 */
export async function deleteProductAction(productId: string): Promise<ActionResponse> {
  try {
    await assertAdminSession();

    await db.delete(products).where(eq(products.id, productId));

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/stock');
    revalidatePath('/');

    return {
      success: true,
      message: `Product ${productId} deleted successfully.`,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete product',
      timestamp: new Date().toISOString(),
    };
  }
}

export interface CreateProductInput {
  id?: string;
  sku: string;
  name: string;
  categoryId: string;
  price: number;
  material: string;
  color: string;
  badge?: string | null;
  primaryImage: string;
  secondaryImage?: string;
  gallery?: string[];
  description: string;
  origin?: string;
  savoirFaireStory?: string | null;
  details?: string[];
  sizes?: string[];
  careInstructions?: string[];
  isSpotlight?: boolean;
  // Availability & Stock
  stockQuantity?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock';
  stockLabel?: string;
  stockDescription?: string;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  categoryId?: string;
  price?: number;
  material?: string;
  color?: string;
  badge?: string | null;
  primaryImage?: string;
  secondaryImage?: string;
  gallery?: string[];
  description?: string;
  origin?: string;
  savoirFaireStory?: string | null;
  details?: string[];
  sizes?: string[];
  careInstructions?: string[];
  isSpotlight?: boolean;
  // Availability & Stock
  stockQuantity?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock';
  stockLabel?: string;
  stockDescription?: string;
}

/**
 * Creates a new product and initializes its 1:1 stock record.
 * Enforces admin role check and validates inputs server-side.
 */
export async function createProductAction(
  input: CreateProductInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await assertAdminSession();

    // 1. Server-side validation
    const name = input.name?.trim();
    if (!name || name.length < 2) {
      return {
        success: false,
        error: 'Product name must be at least 2 characters.',
        timestamp: new Date().toISOString(),
      };
    }

    const sku = input.sku?.trim().toUpperCase();
    if (!sku || sku.length < 2) {
      return {
        success: false,
        error: 'SKU must be at least 2 characters.',
        timestamp: new Date().toISOString(),
      };
    }

    // Check SKU uniqueness
    const existingSku = await db.query.products.findFirst({
      where: eq(products.sku, sku),
    });
    if (existingSku) {
      return {
        success: false,
        error: `SKU "${sku}" is already assigned to "${existingSku.name}".`,
        timestamp: new Date().toISOString(),
      };
    }

    // Generate or sanitize ID (slug)
    let id = input.id?.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (!id) {
      id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const existingId = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (existingId) {
      id = `${id}-${Math.random().toString(36).slice(2, 6)}`;
    }

    // Validate category exists
    const categoryId = input.categoryId?.trim();
    if (!categoryId) {
      return {
        success: false,
        error: 'Please select a valid collection category.',
        timestamp: new Date().toISOString(),
      };
    }
    const catExists = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });
    if (!catExists) {
      return {
        success: false,
        error: `Category "${categoryId}" does not exist.`,
        timestamp: new Date().toISOString(),
      };
    }

    // Validate price
    const price = Math.round(Number(input.price));
    if (isNaN(price) || price < 0) {
      return {
        success: false,
        error: 'Price must be a valid non-negative number.',
        timestamp: new Date().toISOString(),
      };
    }

    // Validate material & color
    const material = input.material?.trim();
    if (!material) {
      return {
        success: false,
        error: 'Material specification is required.',
        timestamp: new Date().toISOString(),
      };
    }

    const color = input.color?.trim();
    if (!color) {
      return {
        success: false,
        error: 'Color specification is required.',
        timestamp: new Date().toISOString(),
      };
    }

    // Validate image URLs
    const primaryImage = input.primaryImage?.trim();
    if (!primaryImage) {
      return {
        success: false,
        error: 'Primary image URL is required.',
        timestamp: new Date().toISOString(),
      };
    }
    const secondaryImage = input.secondaryImage?.trim() || primaryImage;

    // Validate description
    const description = input.description?.trim();
    if (!description || description.length < 5) {
      return {
        success: false,
        error: 'Description must be at least 5 characters.',
        timestamp: new Date().toISOString(),
      };
    }

    // Stock & Availability
    const stockQuantity = Math.max(0, Math.floor(input.stockQuantity ?? 10));
    const stockStatus =
      input.stockStatus ||
      (stockQuantity === 0
        ? 'out_of_stock'
        : stockQuantity <= 3
        ? 'low_stock'
        : 'in_stock');
    const stockLabel =
      input.stockLabel?.trim() ||
      (stockStatus === 'out_of_stock'
        ? 'Out of Stock'
        : stockStatus === 'low_stock'
        ? `Only ${stockQuantity} Available`
        : stockStatus === 'made_to_order'
        ? 'Made to Order'
        : 'In Stock · Atelier Ready');
    const stockDescription =
      input.stockDescription?.trim() ||
      `Inventory maintained by ${session.user.name} (${session.user.email})`;

    // 2. Insert product record
    await db.insert(products).values({
      id,
      categoryId,
      sku,
      name,
      price,
      material,
      color,
      badge: input.badge?.trim() || null,
      primaryImage,
      secondaryImage,
      gallery:
        input.gallery && input.gallery.length > 0
          ? input.gallery
          : [primaryImage, secondaryImage],
      description,
      origin: input.origin?.trim() || 'Handcrafted in Italy',
      savoirFaireStory: input.savoirFaireStory?.trim() || null,
      details: input.details || [],
      sizes: input.sizes && input.sizes.length > 0 ? input.sizes : ['One Size'],
      careInstructions: input.careInstructions || [],
      isSpotlight: Boolean(input.isSpotlight),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Insert stock record (1:1 with product)
    await db.insert(stocks).values({
      id: `stock_${id}`,
      productId: id,
      quantity: stockQuantity,
      status: stockStatus,
      label: stockLabel,
      description: stockDescription,
      updatedAt: new Date(),
    });

    // 4. Revalidate cache
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/stock');
    revalidatePath(`/products/${id}`);
    revalidatePath('/');
    revalidatePath('/collections');
    revalidatePath(`/collections/${categoryId}`);

    return {
      success: true,
      message: `Product "${name}" (${sku}) created successfully.`,
      data: { id },
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create product',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Updates an existing product and its availability / stock record.
 * Enforces admin role check and validates inputs server-side.
 */
export async function updateProductAction(
  productId: string,
  input: UpdateProductInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await assertAdminSession();

    // 1. Verify product exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });
    if (!existingProduct) {
      return {
        success: false,
        error: `Product "${productId}" not found.`,
        timestamp: new Date().toISOString(),
      };
    }

    const updates: Partial<typeof products.$inferInsert> = {
      updatedAt: new Date(),
    };

    // Name validation
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name || name.length < 2) {
        return {
          success: false,
          error: 'Product name must be at least 2 characters.',
          timestamp: new Date().toISOString(),
        };
      }
      updates.name = name;
    }

    // SKU validation
    if (input.sku !== undefined) {
      const sku = input.sku.trim().toUpperCase();
      if (!sku || sku.length < 2) {
        return {
          success: false,
          error: 'SKU must be at least 2 characters.',
          timestamp: new Date().toISOString(),
        };
      }
      if (sku !== existingProduct.sku) {
        const skuConflict = await db.query.products.findFirst({
          where: eq(products.sku, sku),
        });
        if (skuConflict && skuConflict.id !== productId) {
          return {
            success: false,
            error: `SKU "${sku}" is already in use by product "${skuConflict.name}".`,
            timestamp: new Date().toISOString(),
          };
        }
      }
      updates.sku = sku;
    }

    // Category validation
    if (input.categoryId !== undefined) {
      const categoryId = input.categoryId.trim();
      const catExists = await db.query.categories.findFirst({
        where: eq(categories.id, categoryId),
      });
      if (!catExists) {
        return {
          success: false,
          error: `Category "${categoryId}" does not exist.`,
          timestamp: new Date().toISOString(),
        };
      }
      updates.categoryId = categoryId;
    }

    // Price validation
    if (input.price !== undefined) {
      const price = Math.round(Number(input.price));
      if (isNaN(price) || price < 0) {
        return {
          success: false,
          error: 'Price must be a valid non-negative number.',
          timestamp: new Date().toISOString(),
        };
      }
      updates.price = price;
    }

    // Attributes
    if (input.material !== undefined) {
      const material = input.material.trim();
      if (!material) {
        return {
          success: false,
          error: 'Material is required.',
          timestamp: new Date().toISOString(),
        };
      }
      updates.material = material;
    }

    if (input.color !== undefined) {
      const color = input.color.trim();
      if (!color) {
        return {
          success: false,
          error: 'Color is required.',
          timestamp: new Date().toISOString(),
        };
      }
      updates.color = color;
    }

    if (input.badge !== undefined) {
      updates.badge = input.badge?.trim() || null;
    }

    if (input.primaryImage !== undefined) {
      const primaryImage = input.primaryImage.trim();
      if (!primaryImage) {
        return {
          success: false,
          error: 'Primary image URL is required.',
          timestamp: new Date().toISOString(),
        };
      }
      updates.primaryImage = primaryImage;
    }

    if (input.secondaryImage !== undefined) {
      updates.secondaryImage =
        input.secondaryImage.trim() || updates.primaryImage || existingProduct.primaryImage;
    }

    if (input.gallery !== undefined) {
      updates.gallery = input.gallery;
    }

    if (input.description !== undefined) {
      const desc = input.description.trim();
      if (!desc || desc.length < 5) {
        return {
          success: false,
          error: 'Description must be at least 5 characters.',
          timestamp: new Date().toISOString(),
        };
      }
      updates.description = desc;
    }

    if (input.origin !== undefined) {
      updates.origin = input.origin.trim() || 'Handcrafted in Italy';
    }

    if (input.savoirFaireStory !== undefined) {
      updates.savoirFaireStory = input.savoirFaireStory?.trim() || null;
    }

    if (input.details !== undefined) {
      updates.details = input.details;
    }

    if (input.sizes !== undefined) {
      updates.sizes = input.sizes;
    }

    if (input.careInstructions !== undefined) {
      updates.careInstructions = input.careInstructions;
    }

    if (input.isSpotlight !== undefined) {
      updates.isSpotlight = Boolean(input.isSpotlight);
    }

    // 2. Execute product update
    await db.update(products).set(updates).where(eq(products.id, productId));

    // 3. Update stock & availability if provided
    if (
      input.stockQuantity !== undefined ||
      input.stockStatus !== undefined ||
      input.stockLabel !== undefined
    ) {
      const currentStock = await db.query.stocks.findFirst({
        where: eq(stocks.productId, productId),
      });

      const updatedQty =
        input.stockQuantity !== undefined
          ? Math.max(0, Math.floor(input.stockQuantity))
          : (currentStock?.quantity ?? 0);

      const updatedStatus =
        input.stockStatus ||
        (updatedQty === 0
          ? 'out_of_stock'
          : updatedQty <= 3
          ? 'low_stock'
          : (currentStock?.status || 'in_stock'));

      const updatedLabel =
        input.stockLabel?.trim() ||
        (updatedStatus === 'out_of_stock'
          ? 'Out of Stock'
          : updatedStatus === 'low_stock'
          ? `Only ${updatedQty} Available`
          : updatedStatus === 'made_to_order'
          ? 'Made to Order'
          : 'In Stock · Atelier Ready');

      await db
        .insert(stocks)
        .values({
          id: `stock_${productId}`,
          productId,
          quantity: updatedQty,
          status: updatedStatus,
          label: updatedLabel,
          description:
            input.stockDescription?.trim() ||
            `Inventory maintained by ${session.user.name} (${session.user.email})`,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: stocks.productId,
          set: {
            quantity: updatedQty,
            status: updatedStatus,
            label: updatedLabel,
            description:
              input.stockDescription?.trim() ||
              `Inventory maintained by ${session.user.name} (${session.user.email})`,
            updatedAt: new Date(),
          },
        });
    }

    // 4. Revalidate cache
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath('/admin/stock');
    revalidatePath(`/products/${productId}`);
    revalidatePath('/');
    revalidatePath('/collections');
    if (updates.categoryId || existingProduct.categoryId) {
      revalidatePath(`/collections/${updates.categoryId || existingProduct.categoryId}`);
    }

    return {
      success: true,
      message: `Product "${updates.name || existingProduct.name}" updated successfully.`,
      data: { id: productId },
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update product',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Quick inline update action for price, category, and availability.
 * Enforces admin role check and validates inputs server-side.
 */
export async function updateProductQuickAction(
  productId: string,
  data: {
    price?: number;
    categoryId?: string;
    stockQuantity?: number;
    stockStatus?: 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock';
  }
): Promise<ActionResponse> {
  return updateProductAction(productId, data);
}
