import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  Minus,
  History,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Loader2,
  X,
  Sliders
} from 'lucide-react';
import {
  AdminInventoryItemDto,
  AdminInventoryAdjustmentRecordDto
} from '@shared/contracts/admin/admin.dto';
import { adminApi } from '../api/adminApi';

export const InventoryTab: React.FC = () => {
  const [items, setItems] = useState<AdminInventoryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected item for Adjustment
  const [adjustingItem, setAdjustingItem] = useState<AdminInventoryItemDto | null>(null);
  const [quantityDelta, setQuantityDelta] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('STOCK_RECEIPT');
  const [adjustNote, setAdjustNote] = useState<string>('');

  // Selected item for History Modal
  const [historyItem, setHistoryItem] = useState<AdminInventoryItemDto | null>(null);
  const [historyData, setHistoryData] = useState<{
    adjustments: AdminInventoryAdjustmentRecordDto[];
    reservations: any[];
  } | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getInventory({ search: search.trim() || undefined });
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory();
  };

  const handleOpenAdjustment = (item: AdminInventoryItemDto) => {
    setAdjustingItem(item);
    setQuantityDelta(1);
    setAdjustReason('STOCK_RECEIPT');
    setAdjustNote('');
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    if (adjustingItem.onHand + quantityDelta < 0) {
      setError(`Cannot adjust by ${quantityDelta}: resulting stock (${adjustingItem.onHand + quantityDelta}) cannot be negative.`);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const idempotencyKey = `adj_${adjustingItem.productId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await adminApi.adjustStock({
        productId: adjustingItem.productId,
        quantityDelta,
        reason: adjustReason,
        note: adjustNote || undefined,
        idempotencyKey
      });
      setSuccessMsg(`Inventory adjusted successfully for ${adjustingItem.productName}`);
      setAdjustingItem(null);
      loadInventory();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewHistory = async (item: AdminInventoryItemDto) => {
    setHistoryItem(item);
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const data = await adminApi.getProductInventoryHistory(item.productId);
      setHistoryData({
        adjustments: data.adjustments,
        reservations: data.reservations
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory history');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE4DC] shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C221E]">Inventory Operations</h2>
          <p className="text-xs text-[#6E5D53]">Controlled adjustments with audit trails and active reservation monitoring</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInventory}
            className="p-2 text-[#4A3E39] hover:bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8C7A70]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter inventory by SKU or product title..."
          className="w-full pl-9 pr-20 py-2 bg-white border border-[#D5C7BC] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#7A1E3A]"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#2C221E] text-white text-xs font-medium rounded hover:bg-black transition-colors"
        >
          Search
        </button>
      </form>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-[#EBE4DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE4DC] text-[#6E5D53] uppercase font-semibold tracking-wider">
                <th className="py-3 px-4">SKU / Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">On Hand</th>
                <th className="py-3 px-4 text-center">Active Holds</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4">Last Adjustment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE4DC]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1E3A]" />
                    Loading inventory records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.productId} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-[#2C221E] text-xs">{item.sku}</p>
                      <p className="text-[#6E5D53] text-[11px] truncate max-w-[220px]">{item.productName}</p>
                    </td>
                    <td className="py-3 px-4 text-[#6E5D53]">{item.categoryName || '—'}</td>
                    <td className="py-3 px-4 text-center font-bold text-stone-800 text-sm">
                      {item.onHand}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {item.activeReservations > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {item.activeReservations} on hold
                        </span>
                      ) : (
                        <span className="text-stone-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={`px-2.5 py-1 rounded text-xs ${
                        item.available <= 0
                          ? 'bg-rose-100 text-rose-800 font-extrabold'
                          : item.available <= 2
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.available} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6E5D53]">
                      {item.lastAdjustment ? (
                        <div>
                          <p className="font-medium text-[#2C221E] text-[11px]">
                            {item.lastAdjustment.quantityDelta > 0 ? `+${item.lastAdjustment.quantityDelta}` : item.lastAdjustment.quantityDelta}{' '}
                            <span className="text-stone-500 font-normal">({item.lastAdjustment.reason.replace(/_/g, ' ')})</span>
                          </p>
                          <p className="text-[10px] text-[#8C7A70]">{new Date(item.lastAdjustment.createdAt).toLocaleDateString()}</p>
                        </div>
                      ) : (
                        <span className="text-stone-400">No adjustments</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAdjustment(item)}
                          className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#7A1E3A] hover:text-white border border-[#D5C7BC] text-[#4A3E39] text-xs font-semibold rounded transition-colors flex items-center gap-1"
                          title="Adjust Stock"
                        >
                          <Sliders className="w-3 h-3" />
                          Adjust
                        </button>

                        <button
                          onClick={() => handleViewHistory(item)}
                          className="p-1 hover:bg-stone-100 text-stone-600 rounded"
                          title="View Audit Log & Holds"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#EBE4DC] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-bold text-[#2C221E]">Adjust Stock Quantity</h3>
              <button onClick={() => setAdjustingItem(null)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EBE4DC] mb-4 text-xs">
              <p className="font-bold text-[#2C221E]">{adjustingItem.productName}</p>
              <p className="font-mono text-[#8C7A70] mt-0.5">SKU: {adjustingItem.sku}</p>
              <div className="mt-2 flex gap-4 text-stone-700">
                <span>Current On Hand: <strong>{adjustingItem.onHand}</strong></span>
                <span>Available: <strong>{adjustingItem.available}</strong></span>
              </div>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#4A3E39] mb-1">
                  Adjustment Delta (Positive = Add, Negative = Deduct)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantityDelta(d => d - 1)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 rounded text-stone-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    required
                    value={quantityDelta}
                    onChange={(e) => setQuantityDelta(parseInt(e.target.value) || 0)}
                    className="w-full text-center py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded font-bold text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantityDelta(d => d + 1)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 rounded text-stone-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-[#8C7A70] mt-1">
                  New on-hand will be: <strong>{adjustingItem.onHand + quantityDelta}</strong>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3E39] mb-1">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                >
                  <option value="STOCK_RECEIPT">📦 Stock Receipt (New Shipment / Weave Arrival)</option>
                  <option value="MANUAL_CORRECTION">✏️ Manual Count Correction</option>
                  <option value="DAMAGE">⚠️ Damaged / Defective Stock Removed</option>
                  <option value="RETURN_RESTOCK">🔄 Return Restock (Customer Inspection Passed)</option>
                  <option value="CYCLE_COUNT">📋 Periodic Cycle Count</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3E39] mb-1">Internal Audit Note</label>
                <textarea
                  rows={2}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Optional reference e.g. PO-8492, Damaged during warehouse inspection..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EBE4DC]">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || quantityDelta === 0}
                  className="px-4 py-2 bg-[#7A1E3A] hover:bg-[#60172E] text-white font-medium rounded shadow transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Apply Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History & Audit Drawer/Modal */}
      {historyItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 border border-[#EBE4DC] shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE4DC]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#2C221E]">
                  Inventory History: {historyItem.sku}
                </h3>
                <p className="text-xs text-[#6E5D53]">{historyItem.productName}</p>
              </div>
              <button onClick={() => setHistoryItem(null)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {historyLoading ? (
                <div className="py-8 text-center text-[#8C7A70]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1E3A]" />
                  Loading history...
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="font-bold text-[#2C221E] uppercase text-[11px] tracking-wider mb-2">
                      Active Checkout Holds ({historyData?.reservations.length || 0})
                    </h4>
                    {historyData?.reservations.length === 0 ? (
                      <p className="text-stone-400 italic">No active checkout holds.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {historyData?.reservations.map((r: any) => (
                          <div key={r.id} className="p-2.5 bg-amber-50 border border-amber-200 rounded flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-amber-900">{r.quantity} item(s)</span>
                              <span className="text-amber-700 ml-2">Status: {r.status}</span>
                            </div>
                            <span className="text-[10px] text-amber-600">Expires: {new Date(r.expiresAt).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-[#2C221E] uppercase text-[11px] tracking-wider mb-2">
                      Stock Adjustment History
                    </h4>
                    {historyData?.adjustments.length === 0 ? (
                      <p className="text-stone-400 italic">No past adjustments recorded.</p>
                    ) : (
                      <div className="space-y-2">
                        {historyData?.adjustments.map((a) => (
                          <div key={a.id} className="p-2.5 bg-[#FAF7F2] border border-[#EBE4DC] rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-bold ${a.quantityDelta > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {a.quantityDelta > 0 ? `+${a.quantityDelta}` : a.quantityDelta} units ({a.previousOnHand} → {a.newOnHand})
                              </span>
                              <span className="text-[10px] text-[#8C7A70]">{new Date(a.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-stone-700 font-medium">{a.reason.replace(/_/g, ' ')}</p>
                            {a.note && <p className="text-stone-500 text-[11px] italic mt-0.5">"{a.note}"</p>}
                            <p className="text-[10px] text-stone-400 mt-1">Actor: {a.actorEmail || a.actorId}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#EBE4DC] flex justify-end">
              <button
                onClick={() => setHistoryItem(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
