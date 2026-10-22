import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-server';
import { getAdminProductById, getAdminCategories } from '@/db/queries/admin';
import AdminProductForm from '@/components/admin/AdminProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export const metadata = {
  title: 'Edit Product | Atelier Administration',
  description: 'Modify product specifications, pricing, and imagery.',
};

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  // Defense-in-depth: explicit server-side admin verification
  await requireAdmin(`/admin/products/${id}/edit`);

  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    categoryId: product.categoryId,
    price: product.price,
    material: product.material,
    color: product.color,
    badge: product.badge,
    primaryImage: product.primaryImage,
    secondaryImage: product.secondaryImage,
    gallery: product.gallery || [],
    description: product.description,
    origin: product.origin,
    savoirFaireStory: product.savoirFaireStory,
    details: product.details || [],
    sizes: product.sizes || [],
    careInstructions: product.careInstructions || [],
    isSpotlight: product.isSpotlight,
    stock: product.stock
      ? {
          quantity: product.stock.quantity,
          status: product.stock.status as 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock',
          label: product.stock.label,
          description: product.stock.description,
        }
      : null,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2">
          <Link href="/admin/products" className="hover:text-white transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-[#a0978d]">{product.name}</span>
          <span>/</span>
          <span className="text-[#d4af6a]">Edit</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-white font-light">
              Edit Product: {product.name}
            </h1>
            <p className="text-xs text-[#8c8275] mt-1">
              SKU: <span className="font-mono text-[#d4af6a]">{product.sku}</span> · Last updated:{' '}
              {new Date(product.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            href={`/products/${product.id}`}
            target="_blank"
            className="text-[10px] uppercase tracking-[0.2em] text-[#8c8275] hover:text-[#d4af6a] transition-colors"
          >
            Preview on Storefront ↗
          </Link>
        </div>
      </div>

      {/* Edit Form */}
      <AdminProductForm mode="edit" categories={categories} initialData={initialData} />
    </div>
  );
}
