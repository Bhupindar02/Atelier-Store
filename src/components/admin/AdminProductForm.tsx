'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createProductAction, updateProductAction } from '@/app/admin/actions';
import type { AdminCategorySummary } from '@/db/queries/admin';

export interface ProductInitialData {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  price: number;
  material: string;
  color: string;
  badge?: string | null;
  primaryImage: string;
  secondaryImage: string;
  gallery?: string[];
  description: string;
  origin?: string;
  savoirFaireStory?: string | null;
  details?: string[];
  sizes?: string[];
  careInstructions?: string[];
  isSpotlight?: boolean;
  stock?: {
    quantity: number;
    status: 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock';
    label?: string;
    description?: string;
  } | null;
}

interface AdminProductFormProps {
  mode: 'create' | 'edit';
  categories: AdminCategorySummary[];
  initialData?: ProductInitialData;
}

export default function AdminProductForm({
  mode,
  categories,
  initialData,
}: AdminProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || (categories[0]?.id ?? 'handbags')
  );
  const [price, setPrice] = useState(initialData?.price?.toString() || '1850');
  const [material, setMaterial] = useState(initialData?.material || 'Full-grain Tuscan Calfskin');
  const [color, setColor] = useState(initialData?.color || 'Noir Onyx');
  const [badge, setBadge] = useState(initialData?.badge || '');
  const [primaryImage, setPrimaryImage] = useState(
    initialData?.primaryImage ||
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop'
  );
  const [secondaryImage, setSecondaryImage] = useState(
    initialData?.secondaryImage ||
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop'
  );
  const [description, setDescription] = useState(
    initialData?.description ||
      'Sculptural artisanal craftsmanship featuring hand-burnished edges, custom gold-toned brass hardware, and supple calfskin interior lining.'
  );
  const [origin, setOrigin] = useState(initialData?.origin || 'Handcrafted in Italy');
  const [savoirFaireStory, setSavoirFaireStory] = useState(
    initialData?.savoirFaireStory ||
      'Over eighteen hours of meticulous saddlery stitching and hand-buffed edge staining by master artisans in Scandicci, Florence.'
  );

  // List fields
  const [detailsText, setDetailsText] = useState(
    initialData?.details?.join('\n') ||
      'Hand-stitched reinforced rolled leather handles\nDetachable and adjustable leather shoulder strap\nSolid brass protective feet\nInternal zippered compartment with serial plaque'
  );
  const [sizesText, setSizesText] = useState(
    initialData?.sizes?.join(', ') || 'One Size'
  );
  const [careText, setCareText] = useState(
    initialData?.careInstructions?.join('\n') ||
      'Avoid prolonged exposure to direct sunlight and moisture\nStore in supplied organic cotton dust bag\nTreat periodically with natural leather balm'
  );
  const [isSpotlight, setIsSpotlight] = useState(initialData?.isSpotlight ?? false);

  // Availability & Stock
  const [stockQuantity, setStockQuantity] = useState(
    initialData?.stock?.quantity !== undefined ? initialData.stock.quantity.toString() : '8'
  );
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock'>(
    (initialData?.stock?.status as 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock') || 'in_stock'
  );
  const [stockLabel, setStockLabel] = useState(
    initialData?.stock?.label || 'In Stock · Atelier Ready'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const parsedPrice = parseInt(price, 10);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMessage('Price must be a valid non-negative dollar amount.');
      return;
    }

    const parsedQty = parseInt(stockQuantity, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      setErrorMessage('Stock quantity must be a non-negative number.');
      return;
    }

    const parsedDetails = detailsText
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    const parsedSizes = sizesText
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedCare = careText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (mode === 'create') {
        const res = await createProductAction({
          sku,
          name,
          categoryId,
          price: parsedPrice,
          material,
          color,
          badge: badge.trim() || null,
          primaryImage,
          secondaryImage,
          gallery: [primaryImage, secondaryImage],
          description,
          origin,
          savoirFaireStory: savoirFaireStory.trim() || null,
          details: parsedDetails,
          sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
          careInstructions: parsedCare,
          isSpotlight,
          stockQuantity: parsedQty,
          stockStatus,
          stockLabel: stockLabel.trim() || undefined,
        });

        if (res.success) {
          setSuccessMessage(res.message || 'Product created successfully.');
          router.push('/admin/products');
          router.refresh();
        } else {
          setErrorMessage(res.error || 'Failed to create product.');
        }
      } else {
        if (!initialData?.id) return;
        const res = await updateProductAction(initialData.id, {
          name,
          sku,
          categoryId,
          price: parsedPrice,
          material,
          color,
          badge: badge.trim() || null,
          primaryImage,
          secondaryImage,
          gallery: [primaryImage, secondaryImage],
          description,
          origin,
          savoirFaireStory: savoirFaireStory.trim() || null,
          details: parsedDetails,
          sizes: parsedSizes,
          careInstructions: parsedCare,
          isSpotlight,
          stockQuantity: parsedQty,
          stockStatus,
          stockLabel: stockLabel.trim() || undefined,
        });

        if (res.success) {
          setSuccessMessage(res.message || 'Product updated successfully.');
          router.refresh();
        } else {
          setErrorMessage(res.error || 'Failed to update product.');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-4 bg-[#a11826]/10 border border-[#a11826]/40 text-[#f87171] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider">Error:</span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-[#7ee787]/10 border border-[#7ee787]/40 text-[#7ee787] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider">Success:</span>
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Core Product Attributes & Taxonomy */}
        <div className="bg-[#181714] border border-[#2b2823] p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#2b2823] pb-4">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#d4af6a] font-semibold block mb-1">
              STEP 1
            </span>
            <h2 className="font-serif text-lg text-white font-normal">
              Core Identification & Taxonomy
            </h2>
            <p className="text-[11px] text-[#8c8275]">
              Artisanal naming, category classification, and unique inventory SKU.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (mode === 'create' && !sku) {
                    const generatedSku = `ATL-${e.target.value
                      .slice(0, 4)
                      .toUpperCase()
                      .replace(/[^A-Z]/g, 'X')}-001`;
                    setSku(generatedSku);
                  }
                }}
                placeholder="e.g. Atelier Valmont Tote"
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Catalog SKU (Unique Identifier) *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. ATL-VAL-001"
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Collection Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Retail Price (USD $) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-[#8c8275] font-serif">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="3450"
                  className="w-full bg-[#100f0c] border border-[#3a3530] pl-8 pr-4 py-2.5 text-sm text-white font-serif focus:outline-none focus:border-[#d4af6a] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Editorial Badge / Tag
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Rare Craft, Debut, Spotlight"
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Availability & Real-Time Stock Ledger */}
        <div className="bg-[#181714] border border-[#2b2823] p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#2b2823] pb-4">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#d4af6a] font-semibold block mb-1">
              STEP 2
            </span>
            <h2 className="font-serif text-lg text-white font-normal">
              Availability & Stock Allocation
            </h2>
            <p className="text-[11px] text-[#8c8275]">
              Configure current availability state, safety quantities, and client storefront labels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Stock Quantity in Atelier *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setStockQuantity(val);
                  const qty = parseInt(val, 10);
                  if (!isNaN(qty)) {
                    if (qty === 0) setStockStatus('out_of_stock');
                    else if (qty <= 3 && stockStatus !== 'made_to_order') setStockStatus('low_stock');
                    else if (qty > 3 && (stockStatus === 'out_of_stock' || stockStatus === 'low_stock')) {
                      setStockStatus('in_stock');
                    }
                  }
                }}
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Availability Status *
              </label>
              <select
                value={stockStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock';
                  setStockStatus(newStatus);
                  if (newStatus === 'in_stock') setStockLabel('In Stock · Atelier Ready');
                  else if (newStatus === 'low_stock') setStockLabel(`Only ${stockQuantity} Available`);
                  else if (newStatus === 'made_to_order') setStockLabel('Made to Order · 4 Weeks Delivery');
                  else if (newStatus === 'out_of_stock') setStockLabel('Sold Out · Archive Request');
                }}
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
              >
                <option value="in_stock">In Stock (Normal Availability)</option>
                <option value="low_stock">Low Stock (Scarcity Alert)</option>
                <option value="made_to_order">Made to Order (Bespoke Commission)</option>
                <option value="out_of_stock">Out of Stock (Depleted)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Client Availability Badge Label
              </label>
              <input
                type="text"
                value={stockLabel}
                onChange={(e) => setStockLabel(e.target.value)}
                placeholder="e.g. In Stock · Atelier Ready"
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Material, Color & Imagery */}
        <div className="bg-[#181714] border border-[#2b2823] p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#2b2823] pb-4">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#d4af6a] font-semibold block mb-1">
              STEP 3
            </span>
            <h2 className="font-serif text-lg text-white font-normal">
              Materiality & Visual Imagery
            </h2>
            <p className="text-[11px] text-[#8c8275]">
              Curate high-resolution imagery and artisanal finish specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Material & Finish *
              </label>
              <input
                type="text"
                required
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Full-grain Tuscan Calfskin"
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Color Palette *
              </label>
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Noir Onyx / Gold Brass"
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Origin of Manufacture
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Handcrafted in Italy"
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Primary Image URL *
              </label>
              <input
                type="url"
                required
                value={primaryImage}
                onChange={(e) => setPrimaryImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
              {primaryImage && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-[#12110e] border border-[#2b2823]">
                  <div className="relative w-12 h-14 bg-[#23201b] shrink-0">
                    <Image
                      src={primaryImage}
                      alt="Primary preview"
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                  <span className="text-[10px] text-[#8c8275] truncate">Primary Thumbnail Preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Secondary Image URL
              </label>
              <input
                type="url"
                value={secondaryImage}
                onChange={(e) => setSecondaryImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
              {secondaryImage && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-[#12110e] border border-[#2b2823]">
                  <div className="relative w-12 h-14 bg-[#23201b] shrink-0">
                    <Image
                      src={secondaryImage}
                      alt="Secondary preview"
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                  <span className="text-[10px] text-[#8c8275] truncate">Secondary Thumbnail Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Narrative, Specifications & Spotlight */}
        <div className="bg-[#181714] border border-[#2b2823] p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#2b2823] pb-4">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#d4af6a] font-semibold block mb-1">
              STEP 4
            </span>
            <h2 className="font-serif text-lg text-white font-normal">
              Storytelling, Specifications & Curation
            </h2>
            <p className="text-[11px] text-[#8c8275]">
              Detailed craftsmanship narrative, dimensions/sizes, and homepage spotlight positioning.
            </p>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
              Editorial Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descriptive overview of the piece..."
              className="w-full bg-[#100f0c] border border-[#3a3530] p-4 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
              Savoir-Faire Craftsmanship Story
            </label>
            <textarea
              rows={2}
              value={savoirFaireStory}
              onChange={(e) => setSavoirFaireStory(e.target.value)}
              placeholder="Artisanal workshop details, heritage techniques, tanning secrets..."
              className="w-full bg-[#100f0c] border border-[#3a3530] p-4 text-sm text-white focus:outline-none focus:border-[#d4af6a] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Artisanal Details (One per line)
              </label>
              <textarea
                rows={4}
                value={detailsText}
                onChange={(e) => setDetailsText(e.target.value)}
                placeholder="Hand-stitched handles&#10;Brass feet&#10;Internal zip"
                className="w-full bg-[#100f0c] border border-[#3a3530] p-3 text-xs text-white font-mono focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Sizes / Dimensions (Comma-separated)
              </label>
              <input
                type="text"
                value={sizesText}
                onChange={(e) => setSizesText(e.target.value)}
                placeholder="One Size, S, M, L"
                className="w-full bg-[#100f0c] border border-[#3a3530] p-3 text-xs text-white font-mono focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
              <p className="text-[10px] text-[#6b645b] mt-1">E.g. One Size, 38, 40, 42</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2 font-medium">
                Care Instructions (One per line)
              </label>
              <textarea
                rows={4}
                value={careText}
                onChange={(e) => setCareText(e.target.value)}
                placeholder="Avoid water&#10;Store in dust bag"
                className="w-full bg-[#100f0c] border border-[#3a3530] p-3 text-xs text-white font-mono focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#2b2823] flex items-center gap-3">
            <input
              type="checkbox"
              id="isSpotlight"
              checked={isSpotlight}
              onChange={(e) => setIsSpotlight(e.target.checked)}
              className="w-4 h-4 rounded bg-[#100f0c] border-[#3a3530] text-[#d4af6a] focus:ring-[#d4af6a] focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="isSpotlight" className="text-xs text-white font-medium cursor-pointer">
              Curate as Spotlight Feature on Storefront Homepage
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 pb-12">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-[#3a3530] text-[#8c8275] hover:text-white hover:border-[#8c8275] text-[10px] uppercase tracking-[0.2em] transition-colors"
          >
            ← Return to Catalog
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-[#d4af6a] text-[#12110e] text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#e6c382] transition-colors shadow-lg shadow-[#d4af6a]/20 disabled:opacity-50 cursor-pointer"
          >
            {isPending
              ? mode === 'create'
                ? 'Creating Product…'
                : 'Saving Changes…'
              : mode === 'create'
              ? 'Publish New Creation'
              : 'Save Product Modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
