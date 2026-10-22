'use client';

import React, { useState, useTransition } from 'react';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/app/admin/actions';
import type { AdminCategorySummary } from '@/db/queries/admin';

interface AdminCategoryManagerProps {
  initialCategories: AdminCategorySummary[];
}

export default function AdminCategoryManager({
  initialCategories,
}: AdminCategoryManagerProps) {
  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
  });

  const [editingCategory, setEditingCategory] = useState<AdminCategorySummary | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim() || !newCategory.slug.trim()) return;

    setStatusMessage(null);
    startTransition(async () => {
      const catId = newCategory.id.trim() || newCategory.slug.trim();
      const result = await createCategoryAction({
        id: catId,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        displayOrder: Number(newCategory.displayOrder),
      });

      if (result.success) {
        setStatusMessage({ text: result.message || 'Category created.' });
        setCategoriesList((prev) => [
          ...prev,
          {
            id: catId,
            name: newCategory.name,
            slug: newCategory.slug,
            description: newCategory.description || null,
            displayOrder: Number(newCategory.displayOrder),
            productCount: 0,
            createdAt: new Date(),
          },
        ]);
        setNewCategory({ id: '', name: '', slug: '', description: '', displayOrder: 0 });
        setIsCreating(false);
      } else {
        setStatusMessage({ text: result.error || 'Failed to create category.', isError: true });
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setStatusMessage(null);
    startTransition(async () => {
      const result = await updateCategoryAction(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description || undefined,
        displayOrder: editingCategory.displayOrder,
      });

      if (result.success) {
        setStatusMessage({ text: result.message || 'Category updated.' });
        setCategoriesList((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? editingCategory : c))
        );
        setEditingCategory(null);
      } else {
        setStatusMessage({ text: result.error || 'Failed to update category.', isError: true });
      }
    });
  };

  const handleDelete = (categoryId: string, productCount: number) => {
    if (productCount > 0) {
      setStatusMessage({
        text: `Cannot delete: ${productCount} products are assigned to this category.`,
        isError: true,
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    setStatusMessage(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);
      if (result.success) {
        setStatusMessage({ text: result.message || 'Category deleted.' });
        setCategoriesList((prev) => prev.filter((c) => c.id !== categoryId));
      } else {
        setStatusMessage({ text: result.error || 'Failed to delete category.', isError: true });
      }
    });
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          className={`p-4 border text-xs flex items-center justify-between ${
            statusMessage.isError
              ? 'bg-[#a11826]/10 border-[#a11826]/40 text-[#f87171]'
              : 'bg-[#7ee787]/10 border-[#7ee787]/40 text-[#7ee787]'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[10px] uppercase tracking-wider underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[#8c8275]">
          Active Category Taxonomies ({categoriesList.length})
        </h2>
        <button
          type="button"
          onClick={() => {
            setIsCreating(!isCreating);
            setEditingCategory(null);
          }}
          className="px-4 py-2 bg-[#d4af6a] text-[#12110e] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#e6c382] transition-colors cursor-pointer"
        >
          {isCreating ? 'Close Form' : '+ Add Category'}
        </button>
      </div>

      {/* Creation Modal / Collapsible Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-[#181714] border border-[#d4af6a]/40 p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#2b2823]">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#d4af6a] font-medium">
              Create New Department Taxonomy
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-[#8c8275] hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={newCategory.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  setNewCategory((prev) => ({
                    ...prev,
                    name: val,
                    slug: prev.slug || autoSlug,
                    id: prev.id || autoSlug,
                  }));
                }}
                placeholder="e.g. Fine Silk Scarves"
                className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={newCategory.slug}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g. silk-scarves"
                className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af6a]"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={newCategory.displayOrder}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    displayOrder: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
              Description
            </label>
            <input
              type="text"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description for storefront collection header..."
              className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-[#3a3530] text-[9px] uppercase tracking-wider text-[#8c8275]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-[#d4af6a] text-[#12110e] text-[9px] uppercase tracking-wider font-semibold disabled:opacity-50"
            >
              {isPending ? 'Creating…' : 'Save Category'}
            </button>
          </div>
        </form>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <form
          onSubmit={handleUpdate}
          className="bg-[#181714] border border-[#d4af6a]/40 p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#2b2823]">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#d4af6a] font-medium">
              Edit Category: {editingCategory.name}
            </h3>
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="text-[#8c8275] hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory((prev) => (prev ? { ...prev, name: e.target.value } : null))
                }
                className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={editingCategory.displayOrder}
                onChange={(e) =>
                  setEditingCategory((prev) =>
                    prev ? { ...prev, displayOrder: parseInt(e.target.value, 10) || 0 } : null
                  )
                }
                className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
              Description
            </label>
            <input
              type="text"
              value={editingCategory.description || ''}
              onChange={(e) =>
                setEditingCategory((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="px-4 py-2 border border-[#3a3530] text-[9px] uppercase tracking-wider text-[#8c8275]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-[#d4af6a] text-[#12110e] text-[9px] uppercase tracking-wider font-semibold disabled:opacity-50"
            >
              {isPending ? 'Updating…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-[#181714] border border-[#2b2823] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2b2823] bg-[#141310] text-[9px] uppercase tracking-[0.2em] text-[#8c8275]">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Slug / ID</th>
                <th className="py-3 px-4">Display Order</th>
                <th className="py-3 px-4">Assigned Products</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2823]/60 text-xs text-[#a0978d]">
              {categoriesList.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#1f1d18] transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-serif text-white font-normal text-sm">{cat.name}</p>
                    {cat.description && (
                      <p className="text-[10px] text-[#6b645b] truncate max-w-xs">
                        {cat.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#d4af6a]">
                    {cat.slug}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#cfc7bc]">
                    {cat.displayOrder}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-[#23201b] border border-[#3a3530] text-[#cfc7bc]">
                      {cat.productCount} SKUs
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsCreating(false);
                        }}
                        className="px-2.5 py-1 text-[9px] uppercase tracking-wider border border-[#3a3530] text-[#cfc7bc] hover:border-[#d4af6a] hover:text-[#d4af6a] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.productCount)}
                        disabled={isPending || cat.productCount > 0}
                        title={
                          cat.productCount > 0
                            ? 'Cannot delete: products are assigned to this category'
                            : 'Delete category'
                        }
                        className="px-2.5 py-1 text-[9px] uppercase tracking-wider border border-[#3a3530] text-[#8c8275] hover:text-[#f87171] hover:border-[#f87171] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
