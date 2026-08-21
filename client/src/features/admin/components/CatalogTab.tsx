import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  Archive,
  RefreshCw,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { AdminProductDto } from '@shared/contracts/admin/admin.dto';
import { adminApi } from '../api/adminApi';
import { formatMoney } from '@/lib/formatting/money';

export const CatalogTab: React.FC = () => {
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pricingProduct, setPricingProduct] = useState<AdminProductDto | null>(null);

  const [newPrice, setNewPrice] = useState('');
  const [priceReason, setPriceReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Product Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    shortDescription: '',
    longDescription: '',
    priceMinor: '1299900', // 12,999 in minor units
    currency: 'INR',
    categoryId: '',
    status: 'ACTIVE' as 'DRAFT' | 'ACTIVE' | 'ARCHIVED',
    initialOnHand: 10,
    mediaUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    fabric: 'Pure Kanjivaram Silk',
    weave: 'Handloom Korvai',
    zari: 'Pure Gold Zari'
  });

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts({
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          limit: 50
        }),
        adminApi.getCategories()
      ]);
      setProducts(prodRes.products);
      setCategories(catRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleStatusChange = async (productId: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') => {
    try {
      setActionLoading(true);
      await adminApi.updateProductStatus(productId, status);
      setSuccessMsg(`Product status updated to ${status}`);
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingProduct) return;
    try {
      setActionLoading(true);
      const minor = Math.round(parseFloat(newPrice) * 100).toString();
      await adminApi.updateProductPrice(pricingProduct.id, {
        priceMinor: minor,
        currency: pricingProduct.currency,
        reason: priceReason || 'Manual Price Adjustment'
      });
      setSuccessMsg(`Price updated successfully for ${pricingProduct.name}`);
      setPricingProduct(null);
      setNewPrice('');
      setPriceReason('');
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to update price');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await adminApi.createProduct({
        name: formData.name,
        sku: formData.sku || undefined,
        slug: formData.slug || undefined,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        priceMinor: formData.priceMinor,
        currency: formData.currency,
        categoryId: formData.categoryId || undefined,
        status: formData.status,
        initialOnHand: Number(formData.initialOnHand) || 0,
        media: [{ url: formData.mediaUrl, altText: formData.name }],
        sareeDetails: {
          fabric: formData.fabric,
          weaveType: formData.weave,
          zariType: formData.zari
        }
      });
      setSuccessMsg('New Saree product added to catalog');
      setShowCreateModal(false);
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE4DC] shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C221E]">Catalog Management</h2>
          <p className="text-xs text-[#6E5D53]">Manage master saree products, pricing invariants, and status</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="p-2 text-[#4A3E39] hover:bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="admin-btn-add-product"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-[#7A1E3A] hover:bg-[#60172E] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Saree Product
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-800 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8C7A70]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, product title, or slug..."
            className="w-full pl-9 pr-20 py-2 bg-white border border-[#D5C7BC] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#7A1E3A]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#2C221E] text-white text-xs font-medium rounded hover:bg-black transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          {['', 'ACTIVE', 'DRAFT', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                statusFilter === st
                  ? 'bg-[#2C221E] text-white border-[#2C221E]'
                  : 'bg-white text-[#4A3E39] border-[#D5C7BC] hover:bg-[#FAF7F2]'
              }`}
            >
              {st || 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-[#EBE4DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE4DC] text-[#6E5D53] uppercase font-semibold tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock (On Hand / Avail)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE4DC]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1E3A]" />
                    Loading catalog products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primaryMedia?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200'}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-12 object-cover rounded border border-[#EBE4DC]"
                        />
                        <div>
                          <p className="font-semibold text-[#2C221E] text-xs max-w-[200px] truncate">{p.name}</p>
                          <p className="text-[10px] text-[#8C7A70]">{p.sareeDetails?.fabric || 'Pure Silk'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#4A3E39]">{p.sku}</td>
                    <td className="py-3 px-4 text-[#6E5D53]">{p.category?.name || 'Uncategorized'}</td>
                    <td className="py-3 px-4 font-semibold text-[#2C221E]">
                      {formatMoney({ amountMinor: p.price.amountMinor, currency: p.price.currency })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-[#2C221E]">{p.inventorySummary.onHand}</span>
                        <span className="text-stone-400">/</span>
                        <span className={`font-semibold ${p.inventorySummary.available <= 2 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {p.inventorySummary.available} avail
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Price Change */}
                        <button
                          onClick={() => {
                            setPricingProduct(p);
                            setNewPrice((Number(p.price.amountMinor) / 100).toString());
                          }}
                          className="p-1.5 hover:bg-stone-100 rounded text-[#4A3E39] transition-colors"
                          title="Update Price"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-[#7A1E3A]" />
                        </button>

                        {/* Status Toggle */}
                        {p.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(p.id, 'ACTIVE')}
                            disabled={actionLoading}
                            className="p-1.5 hover:bg-emerald-50 rounded text-emerald-700 transition-colors"
                            title="Activate Product"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {p.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(p.id, 'DRAFT')}
                            disabled={actionLoading}
                            className="p-1.5 hover:bg-amber-50 rounded text-amber-700 transition-colors"
                            title="Set to Draft"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {p.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleStatusChange(p.id, 'ARCHIVED')}
                            disabled={actionLoading}
                            className="p-1.5 hover:bg-stone-100 rounded text-stone-600 transition-colors"
                            title="Archive Product"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Update Modal */}
      {pricingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#EBE4DC] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-bold text-[#2C221E]">Update Canonical Price</h3>
              <button onClick={() => setPricingProduct(null)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>

            <p className="text-xs text-[#6E5D53] mb-4">
              Updating price for <strong>{pricingProduct.name}</strong> ({pricingProduct.sku}). This logs an audit event and enforces atomic pricing invariant.
            </p>

            <form onSubmit={handlePriceUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3E39] mb-1">
                  New Price (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-stone-500 font-medium">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="100"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1E3A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3E39] mb-1">
                  Reason for Price Change
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seasonal discount, Festival campaign, Artisan adjustment"
                  value={priceReason}
                  onChange={(e) => setPriceReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#7A1E3A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPricingProduct(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#7A1E3A] hover:bg-[#60172E] text-white text-xs font-medium rounded-lg shadow transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Apply Price Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 border border-[#EBE4DC] shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-bold text-[#2C221E]">Add New Saree to Catalog</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-[#4A3E39] mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Royal Crimson Pure Kanjivaram Silk Saree"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs focus:ring-1 focus:ring-[#7A1E3A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E39] mb-1">SKU (Auto or Custom)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. KNJ-CRM-001"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E39] mb-1">Price (in Minor Units / Paisa)</label>
                  <input
                    type="number"
                    required
                    value={formData.priceMinor}
                    onChange={(e) => setFormData({ ...formData, priceMinor: e.target.value })}
                    placeholder="1299900 (= ₹12,999)"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E39] mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E39] mb-1">Initial Stock On Hand</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.initialOnHand}
                    onChange={(e) => setFormData({ ...formData, initialOnHand: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E39] mb-1">Fabric</label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3E39] mb-1">Weave Technique</label>
                  <input
                    type="text"
                    value={formData.weave}
                    onChange={(e) => setFormData({ ...formData, weave: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-[#4A3E39] mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-[#4A3E39] mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Summary for product listing cards..."
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE4DC]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#7A1E3A] hover:bg-[#60172E] text-white text-xs font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Creating Saree...' : 'Create Saree Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
