import { NextResponse } from 'next/server';
import { getDbProductById } from '@/db/queries/products';
import type { Product } from '@/data/fashion-data';

export interface CartValidationInputItem {
  productId: string;
  size?: string;
  quantity: number;
}

export type StockStatusType = Product['stockState']['status'] | 'out_of_stock';

export interface ValidatedCartItemOutput {
  productId: string;
  size?: string;
  requestedQuantity: number;
  validatedQuantity: number;
  currentPrice: number;
  formattedPrice: string;
  lineTotal: number;
  formattedLineTotal: string;
  maxAvailable: number;
  stockStatus: StockStatusType;
  validationStatus: 'valid' | 'clamped' | 'out_of_stock' | 'not_found';
  product: {
    id: string;
    name: string;
    primaryImage: string;
    material: string;
    color: string;
    sku: string;
    categoryLabel: string;
  };
  warning?: string;
}

export interface CartValidationResponse {
  success: boolean;
  items: ValidatedCartItemOutput[];
  subtotal: number;
  formattedSubtotal: string;
  itemCount: number;
  complimentaryShipping: boolean;
  warnings: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawItems: CartValidationInputItem[] = Array.isArray(body?.items) ? body.items : [];

    if (!Array.isArray(body?.items)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: items must be an array' },
        { status: 400 }
      );
    }

    const validatedItems: ValidatedCartItemOutput[] = [];
    const warnings: string[] = [];

    for (const item of rawItems) {
      if (!item.productId || typeof item.quantity !== 'number') {
        continue;
      }

      // Authoritative product retrieval from DB (ignoring any client-supplied prices)
      const product = await getDbProductById(item.productId);

      if (!product) {
        warnings.push(`Item with identifier "${item.productId}" is no longer in the Atelier catalog.`);
        continue;
      }

      // Determine stock status and max available units
      const isMadeToOrder = product.stockState?.status === 'made_to_order';
      let maxAvailable = typeof product.stockState?.remaining === 'number'
        ? (isMadeToOrder && product.stockState.remaining === 0 ? 5 : product.stockState.remaining)
        : 5;

      const stockStatus: StockStatusType = isMadeToOrder
        ? 'made_to_order'
        : maxAvailable <= 0
        ? 'out_of_stock'
        : product.stockState.status;

      if (!isMadeToOrder && maxAvailable <= 0) {
        maxAvailable = 0;
      }

      const requestedQty = Math.max(1, Math.floor(item.quantity));
      let validatedQty = requestedQty;
      let validationStatus: ValidatedCartItemOutput['validationStatus'] = 'valid';
      let itemWarning: string | undefined;

      if (maxAvailable === 0) {
        validatedQty = 0;
        validationStatus = 'out_of_stock';
        itemWarning = `${product.name} is currently unavailable in the Atelier archive.`;
        warnings.push(itemWarning);
      } else if (requestedQty > maxAvailable) {
        validatedQty = maxAvailable;
        validationStatus = 'clamped';
        itemWarning = `${product.name} allocation capped to ${maxAvailable} (maximum available atelier inventory).`;
        warnings.push(itemWarning);
      }

      const currentPrice = product.price;
      const lineTotal = currentPrice * validatedQty;

      validatedItems.push({
        productId: product.id,
        size: item.size || (product.sizes?.[0] ?? 'One Size'),
        requestedQuantity: requestedQty,
        validatedQuantity: validatedQty,
        currentPrice,
        formattedPrice: `$${currentPrice.toLocaleString()}`,
        lineTotal,
        formattedLineTotal: `$${lineTotal.toLocaleString()}`,
        maxAvailable,
        stockStatus,
        validationStatus,
        product: {
          id: product.id,
          name: product.name,
          primaryImage: product.primaryImage,
          material: product.material,
          color: product.color,
          sku: product.sku,
          categoryLabel: product.categoryLabel,
        },
        warning: itemWarning,
      });
    }

    const subtotal = validatedItems.reduce((acc, item) => acc + item.lineTotal, 0);
    const itemCount = validatedItems.reduce((acc, item) => acc + item.validatedQuantity, 0);

    const responseData: CartValidationResponse = {
      success: true,
      items: validatedItems,
      subtotal,
      formattedSubtotal: `$${subtotal.toLocaleString()}`,
      itemCount,
      complimentaryShipping: subtotal >= 500,
      warnings,
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error('Cart validation error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error validating cart' },
      { status: 500 }
    );
  }
}
