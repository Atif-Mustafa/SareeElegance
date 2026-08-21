import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Loader2,
  Filter,
  UserCheck,
  FileText
} from 'lucide-react';
import { AdminAuditLogDto } from '@shared/contracts/admin/admin.dto';
import { adminApi } from '../api/adminApi';

export const AuditTab: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAuditLogs({
        action: actionFilter || undefined,
        targetType: targetTypeFilter || undefined,
        limit: 100
      });
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter, targetTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE4DC] shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C221E]">Administrative Audit Trail</h2>
          <p className="text-xs text-[#6E5D53]">Immutable ledger of all catalog mutations, manual stock adjustments, refunds, and operational commands</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            className="p-2 text-[#4A3E39] hover:bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm transition-colors flex items-center gap-1.5"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-semibold">Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs font-bold text-[#6E5D53] mr-2">
          <Filter className="w-3.5 h-3.5" />
          Filter Action:
        </div>

        {['', 'PRICE_UPDATED', 'STOCK_ADJUSTED', 'PRODUCT_CREATED', 'RETURN_INSPECTED', 'REFUND_ISSUED'].map((act) => (
          <button
            key={act}
            onClick={() => setActionFilter(act)}
            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
              actionFilter === act
                ? 'bg-[#2C221E] text-white border-[#2C221E]'
                : 'bg-white text-[#4A3E39] border-[#D5C7BC] hover:bg-[#FAF7F2]'
            }`}
          >
            {act ? act.replace(/_/g, ' ') : 'All Actions'}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#EBE4DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE4DC] text-[#6E5D53] uppercase font-semibold tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Metadata / Invariant Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE4DC]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8C7A70]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1E3A]" />
                    Loading audit ledger records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8C7A70]">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3 px-4 text-[#8C7A70] font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-[#2C221E]">
                        <UserCheck className="w-3.5 h-3.5 text-[#7A1E3A]" />
                        <span className="truncate max-w-[150px]">{log.actorEmail || log.actorId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.action.includes('PRICE')
                          ? 'bg-amber-100 text-amber-900'
                          : log.action.includes('STOCK')
                          ? 'bg-purple-100 text-purple-900'
                          : log.action.includes('REFUND')
                          ? 'bg-emerald-100 text-emerald-900'
                          : log.action.includes('REJECT')
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-stone-100 text-stone-800'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-700">
                      <span className="font-semibold text-[#2C221E]">{log.targetType}:</span> {log.targetId.substring(0, 16)}...
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-600 max-w-[300px] truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
