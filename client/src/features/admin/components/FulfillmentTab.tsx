import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Search,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  PackageCheck,
  Send
} from 'lucide-react';
import { AdminOrderListItemDto } from '@shared/contracts/admin/admin.dto';
import { adminApi } from '../api/adminApi';
import { formatMoney } from '@/lib/formatting/money';

export const FulfillmentTab: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrderListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Order for Details Modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getOrders({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        limit: 50
      });
      setOrders(res.orders);
    } catch (err: any) {
      setError(err.message || 'Failed to load fulfillment orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handlePrepareFulfillment = async (orderId: string, orderNumber: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await adminApi.prepareOrder(orderId);
      setSuccessMsg(`Order ${orderNumber} reconciled & prepared for fulfillment`);
      loadOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to prepare order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatchOrder = async (orderId: string, orderNumber: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const shipment = await adminApi.dispatchOrder(orderId);
      setSuccessMsg(`Order ${orderNumber} dispatched! Tracking Number: ${shipment.trackingNumber}`);
      loadOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch shipment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailsLoading(true);
    setOrderDetails(null);
    try {
      const data = await adminApi.getOrderDetails(orderId);
      setOrderDetails(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE4DC] shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C221E]">Fulfillment Console</h2>
          <p className="text-xs text-[#6E5D53]">Process verified orders, trigger warehouse handoffs, and dispatch carrier shipments</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            className="p-2 text-[#4A3E39] hover:bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm transition-colors"
            title="Refresh Orders"
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
            placeholder="Search by Order #, customer email, or phone..."
            className="w-full pl-9 pr-20 py-2 bg-white border border-[#D5C7BC] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#7A1E3A]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#2C221E] text-white text-xs font-medium rounded hover:bg-black transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-1.5 overflow-x-auto">
          {['', 'CONFIRMED', 'READY_FOR_FULFILLMENT', 'DISPATCHED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#2C221E] text-white border-[#2C221E]'
                  : 'bg-white text-[#4A3E39] border-[#D5C7BC] hover:bg-[#FAF7F2]'
              }`}
            >
              {st ? st.replace(/_/g, ' ') : 'All Orders'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#EBE4DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE4DC] text-[#6E5D53] uppercase font-semibold tracking-wider">
                <th className="py-3 px-4">Order # / Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4">Tracking / Carrier</th>
                <th className="py-3 px-4 text-right">Operations Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE4DC]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1E3A]" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7A70]">
                    No orders found matching the filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewOrder(ord.id)}
                        className="font-mono font-bold text-[#7A1E3A] hover:underline text-xs block text-left"
                      >
                        {ord.orderNumber}
                      </button>
                      <span className="text-[10px] text-[#8C7A70]">{new Date(ord.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4 text-[#4A3E39]">
                      <p className="font-medium text-xs truncate max-w-[160px]">{ord.email || 'Guest'}</p>
                      <p className="text-[10px] text-[#8C7A70]">{ord.phone || 'No phone'}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-stone-700">
                      {ord.itemsCount}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2C221E]">
                      {formatMoney({ amountMinor: ord.total.amountMinor, currency: ord.total.currency })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'DISPATCHED'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'READY_FOR_FULFILLMENT'
                          ? 'bg-purple-100 text-purple-800'
                          : ord.status === 'CONFIRMED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {ord.shipment ? (
                        <div>
                          <p className="font-mono font-semibold text-[#2C221E] text-[11px]">
                            {ord.shipment.trackingNumber}
                          </p>
                          <p className="text-[10px] text-[#8C7A70]">{ord.shipment.provider} ({ord.shipment.status})</p>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Not dispatched</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Prepare Fulfillment */}
                        {ord.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handlePrepareFulfillment(ord.id, ord.orderNumber)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs transition-colors flex items-center gap-1 shadow-sm"
                            title="Consume reservations and create fulfillment handoff"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            Prepare
                          </button>
                        )}

                        {/* Dispatch Shipment */}
                        {ord.status === 'READY_FOR_FULFILLMENT' && (
                          <button
                            onClick={() => handleDispatchOrder(ord.id, ord.orderNumber)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded text-xs transition-colors flex items-center gap-1 shadow-sm"
                            title="Generate carrier waybill and dispatch"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Dispatch
                          </button>
                        )}

                        <button
                          onClick={() => handleViewOrder(ord.id)}
                          className="px-2 py-1 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded text-xs"
                        >
                          Details
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

      {/* Order Details Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 border border-[#EBE4DC] shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE4DC]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#2C221E]">
                  Order {orderDetails?.orderNumber || '...'}
                </h3>
                <p className="text-xs text-[#6E5D53]">Status: {orderDetails?.status}</p>
              </div>
              <button onClick={() => setSelectedOrderId(null)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {detailsLoading ? (
                <div className="py-8 text-center text-[#8C7A70]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1E3A]" />
                  Loading details...
                </div>
              ) : orderDetails ? (
                <>
                  {/* Customer and Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF7F2] p-3 rounded-lg border border-[#EBE4DC]">
                    <div>
                      <p className="font-bold text-[#2C221E] uppercase text-[10px] tracking-wider mb-1">Customer Info</p>
                      <p className="font-medium">{orderDetails.email || 'Guest checkout'}</p>
                      <p className="text-[#8C7A70]">{orderDetails.phone || 'No phone'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[#2C221E] uppercase text-[10px] tracking-wider mb-1">Shipping Destination</p>
                      {orderDetails.shippingAddress ? (
                        <p className="text-stone-700">
                          {orderDetails.shippingAddress.recipientName}<br />
                          {orderDetails.shippingAddress.addressLine1}, {orderDetails.shippingAddress.city}<br />
                          {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.pincode}
                        </p>
                      ) : (
                        <p className="text-stone-400 italic">No shipping address recorded</p>
                      )}
                    </div>
                  </div>

                  {/* Line items */}
                  <div>
                    <h4 className="font-bold text-[#2C221E] uppercase text-[11px] tracking-wider mb-2">Order Line Items</h4>
                    <div className="border border-[#EBE4DC] rounded-lg overflow-hidden divide-y divide-[#EBE4DC]">
                      {orderDetails.lines?.map((line: any) => (
                        <div key={line.id} className="p-3 flex items-center justify-between bg-white">
                          <div>
                            <p className="font-semibold text-[#2C221E]">{line.name}</p>
                            <p className="font-mono text-[10px] text-[#8C7A70]">SKU: {line.sku || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-stone-800">Qty: {line.quantity}</p>
                            <p className="text-stone-600">{formatMoney({ amountMinor: line.lineSubtotalMinor, currency: 'INR' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipment Tracking */}
                  {orderDetails.shipment && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          Carrier Shipment: {orderDetails.shipment.provider}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded font-mono font-bold text-[10px]">
                          {orderDetails.shipment.status}
                        </span>
                      </div>
                      <p className="font-mono text-blue-800">Waybill # {orderDetails.shipment.trackingNumber}</p>
                    </div>
                  )}

                  {/* Totals Breakdown */}
                  <div className="pt-2 border-t border-[#EBE4DC] flex justify-between font-bold text-sm text-[#2C221E]">
                    <span>Total Paid:</span>
                    <span>{formatMoney({ amountMinor: orderDetails.totalMinor, currency: 'INR' })}</span>
                  </div>
                </>
              ) : null}
            </div>

            <div className="pt-3 border-t border-[#EBE4DC] flex justify-end">
              <button
                onClick={() => setSelectedOrderId(null)}
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
