import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  ClipboardCheck,
  DollarSign
} from 'lucide-react';
import { AdminReturnListItemDto } from '@shared/contracts/admin/admin.dto';
import { adminApi } from '../api/adminApi';
import { formatMoney } from '@/lib/formatting/money';

export const ReturnsTab: React.FC = () => {
  const [returns, setReturns] = useState<AdminReturnListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Rejection modal
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Inspection modal
  const [inspectingReturn, setInspectingReturn] = useState<any | null>(null);
  const [dispositions, setDispositions] = useState<Record<string, 'RESTOCKABLE' | 'DAMAGED' | 'NON_RESELLABLE'>>({});

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadReturns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getReturns({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        limit: 50
      });
      setReturns(res.returns);
    } catch (err: any) {
      setError(err.message || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReturns();
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await adminApi.approveReturn(id);
      setSuccessMsg('Return approved. Waiting for warehouse arrival/inspection.');
      loadReturns();
    } catch (err: any) {
      setError(err.message || 'Failed to approve return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    try {
      setActionLoading(true);
      setError(null);
      await adminApi.rejectReturn(rejectingId, rejectReason || 'Does not meet return policy criteria');
      setSuccessMsg('Return request rejected');
      setRejectingId(null);
      setRejectReason('');
      loadReturns();
    } catch (err: any) {
      setError(err.message || 'Failed to reject return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenInspect = async (ret: AdminReturnListItemDto) => {
    try {
      setActionLoading(true);
      const full = await adminApi.getReturnById(ret.id);
      setInspectingReturn(full);
      const initialDispositions: Record<string, any> = {};
      full.lines.forEach((l: any) => {
        initialDispositions[l.id] = l.disposition !== 'PENDING' ? l.disposition : 'RESTOCKABLE';
      });
      setDispositions(initialDispositions);
    } catch (err: any) {
      setError(err.message || 'Failed to open inspection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingReturn) return;
    try {
      setActionLoading(true);
      setError(null);
      const payload = Object.entries(dispositions).map(([lineId, disposition]) => ({
        lineId,
        disposition
      }));
      await adminApi.inspectReturn(inspectingReturn.id, payload);
      setSuccessMsg('Inspection recorded & restockable items returned to inventory');
      setInspectingReturn(null);
      loadReturns();
    } catch (err: any) {
      setError(err.message || 'Failed to submit inspection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueRefund = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await adminApi.issueRefund(id);
      setSuccessMsg('Refund issued successfully through payment provider');
      loadReturns();
    } catch (err: any) {
      setError(err.message || 'Failed to issue refund');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE4DC] shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C221E]">Returns & Reverse Logistics Desk</h2>
          <p className="text-xs text-[#6E5D53]">Manage customer returns, textile inspection grading, and refund issuance</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadReturns}
            className="p-2 text-[#4A3E39] hover:bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm transition-colors"
            title="Refresh Returns"
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8C7A70]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Return ID or Order #..."
            className="w-full pl-9 pr-20 py-2 bg-white border border-[#D5C7BC] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#7A1E3A]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#2C221E] text-white text-xs font-medium rounded hover:bg-black transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-1.5">
          {['', 'REQUESTED', 'APPROVED', 'INSPECTED', 'CLOSED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#2C221E] text-white border-[#2C221E]'
                  : 'bg-white text-[#4A3E39] border-[#D5C7BC] hover:bg-[#FAF7F2]'
              }`}
            >
              {st || 'All Returns'}
            </button>
          ))}
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-xl border border-[#EBE4DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE4DC] text-[#6E5D53] uppercase font-semibold tracking-wider">
                <th className="py-3 px-4">Order # / Return ID</th>
                <th className="py-3 px-4">Return Reason</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4">Return Status</th>
                <th className="py-3 px-4">Refund Status</th>
                <th className="py-3 px-4">Refund Amount</th>
                <th className="py-3 px-4 text-right">Reverse Ops Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE4DC]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1E3A]" />
                    Loading returns...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    No return requests found.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-[#7A1E3A] text-xs">{ret.orderNumber}</p>
                      <p className="font-mono text-[10px] text-[#8C7A70]">{ret.id.substring(0, 13)}...</p>
                    </td>
                    <td className="py-3 px-4 text-[#4A3E39] max-w-[200px] truncate">
                      {ret.reason || 'Customer requested return'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-stone-700">
                      {ret.linesCount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        ret.status === 'CLOSED'
                          ? 'bg-stone-200 text-stone-800'
                          : ret.status === 'INSPECTED'
                          ? 'bg-purple-100 text-purple-800'
                          : ret.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : ret.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        ret.refundStatus === 'PROCESSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ret.refundStatus === 'FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : ret.refundStatus === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {ret.refundStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2C221E]">
                      {ret.refundAmount ? formatMoney({ amountMinor: ret.refundAmount.amountMinor, currency: ret.refundAmount.currency }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Step 1: Approve / Reject */}
                        {ret.status === 'REQUESTED' && (
                          <>
                            <button
                              onClick={() => handleApprove(ret.id)}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                              title="Approve Return Request"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(ret.id)}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded text-xs font-medium"
                              title="Reject Return Request"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Step 2: Inspect */}
                        {ret.status === 'APPROVED' && (
                          <button
                            onClick={() => handleOpenInspect(ret)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-medium flex items-center gap-1"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            Inspect
                          </button>
                        )}

                        {/* Step 3: Issue Refund */}
                        {ret.status === 'INSPECTED' && ret.refundStatus !== 'PROCESSED' && (
                          <button
                            onClick={() => handleIssueRefund(ret.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Issue Refund
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

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#EBE4DC] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-bold text-[#2C221E]">Reject Return Request</h3>
              <button onClick={() => setRejectingId(null)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#4A3E39] mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Return window expired, item marked non-returnable..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C7BC] rounded text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EBE4DC]">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-medium rounded shadow transition-colors"
                >
                  Reject Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {inspectingReturn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 border border-[#EBE4DC] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#2C221E]">Textile Quality Inspection</h3>
                <p className="text-xs text-[#6E5D53]">Order #{inspectingReturn.orderNumber}</p>
              </div>
              <button onClick={() => setInspectingReturn(null)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>

            <form onSubmit={handleSaveInspection} className="space-y-4 text-xs">
              <div className="space-y-3">
                {inspectingReturn.lines?.map((line: any) => (
                  <div key={line.id} className="p-3 bg-[#FAF7F2] border border-[#EBE4DC] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#2C221E]">{line.productName}</p>
                        <p className="font-mono text-[10px] text-[#8C7A70]">SKU: {line.sku || 'N/A'} (Qty: {line.quantity})</p>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#4A3E39] mb-1">Inspection Disposition</label>
                      <select
                        value={dispositions[line.id] || 'RESTOCKABLE'}
                        onChange={(e) => setDispositions({ ...dispositions, [line.id]: e.target.value as any })}
                        className="w-full px-3 py-1.5 bg-white border border-[#D5C7BC] rounded text-xs"
                      >
                        <option value="RESTOCKABLE">✅ Restockable (Pristine silk condition, auto-restocks inventory)</option>
                        <option value="DAMAGED">⚠️ Damaged / Stained / Thread pulled (Do NOT restock)</option>
                        <option value="NON_RESELLABLE">❌ Non-resellable (Destroy / Artisan rework)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE4DC]">
                <button
                  type="button"
                  onClick={() => setInspectingReturn(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#7A1E3A] hover:bg-[#60172E] text-white font-medium rounded shadow transition-colors"
                >
                  Complete Inspection & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
