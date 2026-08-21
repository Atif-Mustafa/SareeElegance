import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { adminApi } from '../api/adminApi';

export const ShippingTab: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getShipments({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        limit: 50
      });
      setShipments(res.shipments);
    } catch (err: any) {
      setError(err.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadShipments();
  };

  const handleRetryShipment = async (orderId: string, orderNumber: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await adminApi.retryShipment(orderId);
      setSuccessMsg(`Shipment regenerated for Order ${orderNumber}: ${res.trackingNumber}`);
      loadShipments();
    } catch (err: any) {
      setError(err.message || 'Failed to retry shipment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    setDetailsLoading(true);
    setSelectedShipment(null);
    try {
      const data = await adminApi.getShipmentById(id);
      setSelectedShipment(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load shipment details');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE4DC] shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C221E]">Shipping Monitor</h2>
          <p className="text-xs text-[#6E5D53]">Monitor carrier dispatched waybills, tracking telemetry, and delivery events</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadShipments}
            className="p-2 text-[#4A3E39] hover:bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm transition-colors"
            title="Refresh Shipments"
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

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8C7A70]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Waybill / Tracking #, Provider ID, or Order #..."
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
          {['', 'LABEL_CREATED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#2C221E] text-white border-[#2C221E]'
                  : 'bg-white text-[#4A3E39] border-[#D5C7BC] hover:bg-[#FAF7F2]'
              }`}
            >
              {st ? st.replace(/_/g, ' ') : 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl border border-[#EBE4DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE4DC] text-[#6E5D53] uppercase font-semibold tracking-wider">
                <th className="py-3 px-4">Tracking Waybill #</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Carrier Status</th>
                <th className="py-3 px-4">Dispatched At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE4DC]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1E3A]" />
                    Loading shipments...
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewDetails(s.id)}
                        className="font-mono font-bold text-[#7A1E3A] hover:underline"
                      >
                        {s.trackingNumber || s.id}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2C221E]">{s.provider}</td>
                    <td className="py-3 px-4 font-mono text-[#4A3E39]">{s.orderNumber}</td>
                    <td className="py-3 px-4 text-[#6E5D53] truncate max-w-[160px]">{s.customerEmail}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        s.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'OUT_FOR_DELIVERY' || s.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-800'
                          : s.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#8C7A70]">
                      {s.dispatchedAt ? new Date(s.dispatchedAt).toLocaleString() : 'Pending'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetryShipment(s.orderId, s.orderNumber)}
                            disabled={actionLoading}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs"
                          >
                            Retry Dispatch
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(s.id)}
                          className="px-2 py-1 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded text-xs"
                        >
                          Events
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

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 border border-[#EBE4DC] shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE4DC]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#2C221E]">
                  Waybill #{selectedShipment.trackingNumber}
                </h3>
                <p className="text-xs text-[#6E5D53]">Carrier: {selectedShipment.provider} | Status: {selectedShipment.status}</p>
              </div>
              <button onClick={() => setSelectedShipment(null)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Destination */}
              {selectedShipment.shippingAddress && (
                <div className="p-3 bg-[#FAF7F2] border border-[#EBE4DC] rounded-lg">
                  <p className="font-bold text-[#2C221E] uppercase text-[10px] tracking-wider mb-1">Destination</p>
                  <p className="text-stone-700">
                    {selectedShipment.shippingAddress.recipientName}<br />
                    {selectedShipment.shippingAddress.addressLine1}, {selectedShipment.shippingAddress.city}<br />
                    {selectedShipment.shippingAddress.state} - {selectedShipment.shippingAddress.pincode}
                  </p>
                </div>
              )}

              {/* Status Timeline */}
              <div>
                <h4 className="font-bold text-[#2C221E] uppercase text-[11px] tracking-wider mb-2">Carrier Telemetry Events</h4>
                <div className="space-y-2">
                  {selectedShipment.statusHistory?.map((ev: any) => (
                    <div key={ev.id} className="p-2.5 bg-white border border-[#EBE4DC] rounded flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#7A1E3A] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2C221E]">{ev.status.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-[#8C7A70]">{new Date(ev.createdAt).toLocaleString()}</span>
                        </div>
                        {ev.reason && <p className="text-stone-600 text-[11px] mt-0.5">{ev.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EBE4DC] flex justify-end">
              <button
                onClick={() => setSelectedShipment(null)}
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
