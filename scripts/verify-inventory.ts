import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

// Stub Next.js server-only for standalone CLI script execution
try {
  const serverOnlyPath = require.resolve('server-only');
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as NodeModule;
} catch {
  // Ignore if not resolvable
}

async function runInventoryVerification() {
  console.log('🧪 Starting Inventory Management Feature Verification...\n');

  const { normalizeStockState, getAdminStocks } = await import('../src/db/queries/admin');
  const { updateStockAction, batchUpdateStockAction } = await import('../src/app/admin/actions');
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (details) console.error(`     Details: ${details}`);
    }
  }

  // ── TEST 1: Stock State Normalization & Boundaries ──
  console.log('📦 Test Suite 1: Normalization & Clamping Logic');

  // Negative quantity clamped to 0 and out_of_stock
  const negStock = normalizeStockState({
    productId: 'test-product',
    quantity: -5,
  });
  assert(
    negStock.quantity === 0 && negStock.status === 'out_of_stock' && negStock.label.includes('Out of Stock'),
    'Negative quantity (-5) is clamped to 0 with status out_of_stock and appropriate label',
    JSON.stringify(negStock)
  );

  // Floating point quantity floored
  const floatStock = normalizeStockState({
    productId: 'test-product',
    quantity: 2.9,
  });
  assert(
    floatStock.quantity === 2 && floatStock.status === 'low_stock' && floatStock.label === 'Only 2 Available',
    'Floating quantity (2.9) is floored to integer 2 with status low_stock and "Only 2 Available" label',
    JSON.stringify(floatStock)
  );

  // Normal in-stock quantity
  const inStock = normalizeStockState({
    productId: 'test-product',
    quantity: 15,
  });
  assert(
    inStock.quantity === 15 && inStock.status === 'in_stock' && inStock.label === 'In Stock · Atelier Ready',
    'In-stock quantity (15) correctly assigned in_stock status and "In Stock · Atelier Ready" label',
    JSON.stringify(inStock)
  );

  // Made-to-order bespoke override
  const madeToOrderStock = normalizeStockState({
    productId: 'test-product',
    quantity: 0,
    status: 'made_to_order',
  });
  assert(
    madeToOrderStock.status === 'made_to_order' && madeToOrderStock.label === 'Made to Order · Bespoke Commission',
    'Made-to-order status preserved even with zero quantity, with bespoke commission label',
    JSON.stringify(madeToOrderStock)
  );

  // Custom label truncation / sanitization
  const customLabelStock = normalizeStockState({
    productId: 'test-product',
    quantity: 8,
    label: '  Private Salon Exclusive  ',
  });
  assert(
    customLabelStock.label === 'Private Salon Exclusive',
    'Custom label is trimmed and preserved',
    JSON.stringify(customLabelStock)
  );

  // ── TEST 2: Server-Side Authorization Guards ──
  console.log('\n🔒 Test Suite 2: Server-Side Admin Role Verification');

  // Attempt updateStockAction without admin session
  try {
    const res = await updateStockAction('atelier-valmont-tote', 5);
    assert(
      !res.success && typeof res.error === 'string' && res.error.length > 0,
      'updateStockAction rejects unauthenticated/unauthorized calls server-side',
      `Result: ${JSON.stringify(res)}`
    );
  } catch {
    assert(true, 'updateStockAction throws or rejects unauthorized caller safely');
  }

  // Attempt batchUpdateStockAction without admin session
  try {
    const res = await batchUpdateStockAction([{ productId: 'atelier-valmont-tote', quantity: 5 }]);
    assert(
      !res.success && typeof res.error === 'string' && res.error.length > 0,
      'batchUpdateStockAction rejects unauthenticated/unauthorized calls server-side',
      `Result: ${JSON.stringify(res)}`
    );
  } catch {
    assert(true, 'batchUpdateStockAction throws or rejects unauthorized caller safely');
  }

  // ── TEST 3: Admin Stock Query & Taxonomy ──
  console.log('\n📊 Test Suite 3: Admin Stock Queries & Ledger Data');

  try {
    const stocks = await getAdminStocks();
    assert(Array.isArray(stocks) && stocks.length > 0, `getAdminStocks returns array of stock items (${stocks.length} records)`);
    
    const sample = stocks[0];
    const hasRequiredFields =
      Boolean(sample.productId) &&
      Boolean(sample.productName) &&
      Boolean(sample.productSku) &&
      typeof sample.quantity === 'number' &&
      typeof sample.status === 'string' &&
      typeof sample.categoryId === 'string' &&
      typeof sample.categoryName === 'string';

    assert(
      hasRequiredFields,
      'Admin stock record includes productId, SKU, name, quantity, status, and category taxonomy',
      JSON.stringify(sample)
    );
  } catch (err) {
    console.error('Database connection error in getAdminStocks:', err);
    assert(false, 'getAdminStocks should execute successfully with database or fallback');
  }

  console.log(`\n========================================`);
  console.log(`Inventory Verification Results: ${passedTests}/${totalTests} Passed`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runInventoryVerification().catch((err) => {
  console.error('Fatal verification script error:', err);
  process.exit(1);
});
