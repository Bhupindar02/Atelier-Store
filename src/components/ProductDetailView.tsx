'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, getRelatedProducts } from '@/data/fashion-data';
import { useStore } from '@/context/StoreContext';

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes ? product.sizes[0] : 'One Size'
  );
  const [activeAccordion, setActiveAccordion] = useState<string | null>('specs');
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const wishlisted = isInWishlist(product.id);
  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.primaryImage, product.secondaryImage];

  const relatedProducts = getRelatedProducts(product.id, 3);

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2500);
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="bg-[#faf9f7] pb-24">
      {/* ── BREADCRUMB & BACK LINK ── */}
      <div className="border-b border-[#e8e3db] bg-[#faf9f7]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between text-[10px] tracking-[0.2em] uppercase font-medium text-[#8e857b]">
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-[#1a1714] transition-colors">
              Maison Atelier
            </Link>
            <span>/</span>
            <Link href="/#products" className="hover:text-[#1a1714] transition-colors">
              {product.categoryLabel}
            </Link>
            <span>/</span>
            <span className="text-[#1a1714] truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          <Link
            href="/#products"
            className="hidden sm:inline-flex items-center gap-1.5 text-[#1a1714] hover:text-[#a11826] transition-colors"
          >
            <span>←</span>
            <span>Return to Collection</span>
          </Link>
        </div>
      </div>

      {/* ── MAIN PRODUCT SECTION ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-8 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* ── LEFT: LARGE EDITORIAL IMAGERY (Sticky gallery or multi-angle viewer) ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Large Editorial Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#f2ede6] border border-[#e8e3db] shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
              <Image
                src={gallery[selectedImageIndex]}
                alt={`${product.name} - View ${selectedImageIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-all duration-700 ease-out"
              />

              {/* Badge Overlay */}
              {product.badge && (
                <div className="absolute top-4 left-4 bg-[#11100e] text-[#faf9f7] px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] font-medium shadow-sm">
                  {product.badge}
                </div>
              )}

              {/* Origin Stamp */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-medium text-[#1a1714] border border-[#e8e3db]">
                {product.origin}
              </div>

              {/* Wishlist toggle */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#1a1714] hover:text-[#a11826] transition-colors shadow-sm"
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg
                  className="w-5 h-5 stroke-[1.2]"
                  fill={wishlisted ? '#a11826' : 'none'}
                  stroke={wishlisted ? '#a11826' : 'currentColor'}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-[3/4] overflow-hidden bg-[#f2ede6] border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#1a1714] ring-1 ring-[#1a1714]'
                      : 'border-[#e8e3db] opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} angle ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 25vw, 15vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Editorial Savoir-Faire Pull Quote */}
            {product.savoirFaireStory && (
              <div className="p-8 bg-[#f5f2ed] border border-[#e8e3db] space-y-3 mt-8">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#a11826] block">
                  ATELIER SAVOIR-FAIRE
                </span>
                <p className="font-serif text-xl sm:text-2xl text-[#1a1714] leading-snug font-light italic">
                  &ldquo;{product.savoirFaireStory}&rdquo;
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8e857b]">
                  Maison Atelier · Heritage Workshops
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: PRODUCT INFORMATION, PRICING, STOCK STATE & ACTIONS ── */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28 self-start">
            
            {/* Header: Category & SKU */}
            <div className="space-y-3 pb-6 border-b border-[#e8e3db]">
              <div className="flex items-center justify-between text-[10px] tracking-[0.25em] uppercase text-[#8e857b]">
                <span>{product.categoryLabel}</span>
                <span className="font-mono">REF: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#1a1714] leading-tight">
                {product.name}
              </h1>

              {/* Material subtitle */}
              <p className="text-xs sm:text-sm text-[#70675e] tracking-wider uppercase">
                {product.material} · {product.color}
              </p>

              {/* Price */}
              <div className="pt-2 flex items-baseline gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-medium text-[#1a1714]">
                  {product.formattedPrice}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b]">
                  Import Duties & Insured Shipping Included
                </span>
              </div>
            </div>

            {/* ── STOCK STATE (Prominent luxury stock indicator) ── */}
            <div className="p-4 bg-[#f5f2ed] border border-[#e0dad1] space-y-2">
              <div className="flex items-center gap-2.5">
                {product.stockState.status === 'in_stock' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1a3d2e]">
                      {product.stockState.label}
                    </span>
                  </>
                )}
                {product.stockState.status === 'low_stock' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a11826] animate-ping" />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#a11826]">
                      {product.stockState.label}
                    </span>
                  </>
                )}
                {product.stockState.status === 'made_to_order' && (
                  <>
                    <span className="text-[#b8962e]">✦</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#8a6e1a]">
                      {product.stockState.label}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-[#5c544d] font-light leading-relaxed">
                {product.stockState.description}
              </p>
            </div>

            {/* Narrative description */}
            <p className="text-sm text-[#5c544d] font-light leading-relaxed">
              {product.description}
            </p>

            {/* Size & Proportion Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#1a1714]">
                    Size / Proportion:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveAccordion('specs')}
                    className="text-[10px] uppercase tracking-[0.18em] text-[#8e857b] hover:text-[#1a1714] underline underline-offset-4"
                  >
                    View Dimensions
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-5 py-3 text-xs tracking-wider uppercase border transition-all ${
                        selectedSize === sz
                          ? 'border-[#1a1714] bg-[#1a1714] text-white shadow-sm'
                          : 'border-[#d8d0c5] bg-white text-[#1a1714] hover:border-[#1a1714]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── ACTION BUTTONS: ACQUIRE / ADD TO BAG & WISHLIST ── */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4.5 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-[#a11826] transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <span>
                  {isAddedSuccess ? 'Added to Bag ✓' : `Acquire — ${product.formattedPrice}`}
                </span>
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="flex-1 py-3.5 border border-[#1a1714] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4 stroke-[1.2]"
                    fill={wishlisted ? '#a11826' : 'none'}
                    stroke={wishlisted ? '#a11826' : 'currentColor'}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                  <span>{wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <a
                  href="#concierge"
                  className="flex-1 py-3.5 border border-[#d8d0c5] text-center text-[#5c544d] text-[10px] uppercase tracking-[0.2em] font-medium hover:border-[#1a1714] hover:text-[#1a1714] transition-colors"
                >
                  Book Salon View
                </a>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-2 border-t border-[#e8e3db] grid grid-cols-2 gap-4 text-[10px] uppercase tracking-[0.18em] text-[#70675e]">
              <div className="flex items-center gap-2">
                <span className="text-[#a11826]">✦</span>
                <span>White-Glove Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#a11826]">✦</span>
                <span>Complimentary Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#a11826]">✦</span>
                <span>Signature Gift Box</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#a11826]">✦</span>
                <span>Artisan Authenticity</span>
              </div>
            </div>

            {/* ── SAVOIR-FAIRE ACCORDIONS (Gucci Luxury Standard) ── */}
            <div className="border-t border-[#e8e3db] divide-y divide-[#e8e3db] pt-2">
              
              {/* Accordion 1: Specifications */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('specs')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-[0.22em] font-medium text-[#1a1714] focus:outline-none"
                >
                  <span>Craftsmanship & Dimensions</span>
                  <span>{activeAccordion === 'specs' ? '—' : '+'}</span>
                </button>
                {activeAccordion === 'specs' && (
                  <div className="mt-4 space-y-2.5 text-xs text-[#5c544d] font-light leading-relaxed animate-fade-in">
                    <ul className="space-y-2">
                      {product.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-[#a11826] mt-0.5">✦</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: Care & Maintenance */}
              {product.careInstructions && (
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('care')}
                    className="w-full flex items-center justify-between text-left text-xs uppercase tracking-[0.22em] font-medium text-[#1a1714] focus:outline-none"
                  >
                    <span>Care & Conservation</span>
                    <span>{activeAccordion === 'care' ? '—' : '+'}</span>
                  </button>
                  {activeAccordion === 'care' && (
                    <div className="mt-4 space-y-2 text-xs text-[#5c544d] font-light leading-relaxed animate-fade-in">
                      <ul className="space-y-1.5">
                        {product.careInstructions.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="text-[#8e857b] mt-0.5">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 3: Delivery & Returns */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-[0.22em] font-medium text-[#1a1714] focus:outline-none"
                >
                  <span>Complimentary Shipping & Returns</span>
                  <span>{activeAccordion === 'shipping' ? '—' : '+'}</span>
                </button>
                {activeAccordion === 'shipping' && (
                  <div className="mt-4 space-y-3 text-xs text-[#5c544d] font-light leading-relaxed animate-fade-in">
                    <p>
                      Maison Atelier provides complimentary insured courier delivery on all orders. Your creation arrives packaged inside our signature archival box, tied with grosgrain ribbon and nestled in a velvet protective pouch.
                    </p>
                    <p>
                      We accept complimentary returns and exchanges within 30 days of receipt, provided the creation remains in pristine, unworn condition with all authenticity security tags attached.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── RELATED CREATIONS: "YOU MAY ALSO ADMIRE" ── */}
        <div className="mt-32 pt-16 border-t border-[#e8e3db]">
          <div className="text-center space-y-2 mb-14">
            <span className="text-[10px] tracking-[0.3em] font-medium uppercase text-[#a11826]">
              COMPLEMENTARY SILHOUETTES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1a1714]">
              You May Also Admire
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/products/${rel.id}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f2ede6] border border-[#e8e3db]">
                  <Image
                    src={rel.primaryImage}
                    alt={rel.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {rel.badge && (
                    <div className="absolute top-3 left-3 bg-[#11100e] text-[#faf9f7] px-2.5 py-1 text-[8px] tracking-[0.25em] uppercase font-medium">
                      {rel.badge}
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#8e857b]">
                      {rel.categoryLabel}
                    </span>
                    <span className="font-mono text-xs font-medium text-[#1a1714]">
                      {rel.formattedPrice}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg text-[#1a1714] group-hover:text-[#a11826] transition-colors">
                    {rel.name}
                  </h3>
                  <p className="text-[11px] text-[#70675e] truncate">
                    {rel.material}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
