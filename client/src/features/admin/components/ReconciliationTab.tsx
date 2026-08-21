import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  Layers,
  Truck,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { ReconciliationExceptionsDto } from '@shared/contracts/admin/admin.dto';
import { adminApi } from '../api/adminApi';
import { formatMoney } from '@/lib/formatting/money';

export const ReconciliationTab: React.FC = () => {
  const [exceptions, setExceptions] = useState<ReconciliationExceptionsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadExceptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getReconciliationExceptions();
      setExceptions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reconciliation exceptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExceptions();
  }, []);

  const handleRetryOrder = async (orderId: string, orderNumber: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await adminApi.retryReconciliationOrder(orderId);
      setSuccessMsg(`Order ${orderNumber} retried successfully.`);
      loadExceptions();
    } catch (err: any) {
      setError(err.message || 'Failed to retry order reconciliation');
    } finally {
      setActionLoading(false);
    }
  };

  const totalExceptions =
    (exceptions?.orphanedPayments.length || 0) +
    (exceptions?.unreconciledOrders.length || 0) +
    (exceptions?.stalledFulfillments.length || 0) +
    (exceptions?.failedRefunds.length || 0) +
    (exceptions?.inventoryAnomalies.length || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE4DC] shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2C221E]">Subsystem Reconciliation & Exception Monitor</h2>
          <p className="text-xs text-[#6E5D53]">Authoritative detection of orphaned payments, unreconciled orders, fulfillment delays, failed refunds, and inventory drift</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadExceptions}
            className="p-2 text-[#4A3E39] hover:bg-[#FAF7F2] border border-[#D5C7BC] rounded-lg text-sm transition-colors flex items-center gap-1.5"
            title="Scan Exceptions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-semibold">Rescan Subsystems</span>
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

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#EBE4DC] shadow-sm">
          <p className="text-[11px] text-[#6E5D53] font-medium flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            Orphaned Payments
          </p>
          <p className="text-xl font-bold text-[#2C221E] mt-1">
            {exceptions?.orphanedPayments.length ?? 0}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#EBE4DC] shadow-sm">
          <p className="text-[11px] text-[#6E5D53] font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Unreconciled Orders
          </p>
          <p className="text-xl font-bold text-[#2C221E] mt-1">
            {exceptions?.unreconciledOrders.length ?? 0}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#EBE4DC] shadow-sm">
          <p className="text-[11px] text-[#6E5D53] font-medium flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            Stalled Handoffs
          </p>
          <p className="text-xl font-bold text-[#2C221E] mt-1">
            {exceptions?.stalledFulfillments.length ?? 0}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#EBE4DC] shadow-sm">
          <p className="text-[11px] text-[#6E5D53] font-medium flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            Failed Refunds
          </p>
          <p className="text-xl font-bold text-[#2C221E] mt-1">
            {exceptions?.failedRefunds.length ?? 0}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#EBE4DC] shadow-sm">
          <p className="text-[11px] text-[#6E5D53] font-medium flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-stone-600" />
            Inventory Anomalies
          </p>
          <p className="text-xl font-bold text-[#2C221E] mt-1">
            {exceptions?.inventoryAnomalies.length ?? 0}
          </p>
        </div>
      </div>

      {/* Exception Categories List */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-[#EBE4DC] text-center text-[#8C7A70]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1E3A]" />
          Scanning system invariants...
        </div>
      ) : totalExceptions === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-[#EBE4DC] text-center">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#2C221E]">All Subsystems Authoritatively Synchronized</h3>
          <p className="text-xs text-[#6E5D53] max-w-md mx-auto mt-1">
            No orphaned payments, unreconciled orders, stalled carrier handoffs, failed refunds, or inventory anomalies detected.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Orphaned Payments */}
          {exceptions?.orphanedPayments && exceptions.orphanedPayments.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-sm">
              <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <h3 className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                    Orphaned Succeeded Payments (No Attached Order)
                  </h3>
                </div>
                <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  {exceptions.orphanedPayments.length} records
                </span>
              </div>
              <div className="divide-y divide-amber-100 text-xs">
                {exceptions.orphanedPayments.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-stone-800">
                        Payment Attempt ID: {p.id}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Session: {p.checkoutSessionId} | Amount: {formatMoney({ amountMinor: p.amountMinor, currency: p.currency })} | Status: {p.status}
                      </p>
                    </div>
                    <span className="text-[10px] text-amber-700 font-mono">{new Date(p.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Unreconciled Orders */}
          {exceptions?.unreconciledOrders && exceptions.unreconciledOrders.length > 0 && (
            <div className="bg-white rounded-xl border border-rose-200 overflow-hidden shadow-sm">
              <div className="bg-rose-50 px-4 py-3 border-b border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <h3 className="font-bold text-rose-900 text-xs uppercase tracking-wider">
                    Unreconciled Orders (Missing Reservations or Addresses)
                  </h3>
                </div>
                <span className="bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  {exceptions.unreconciledOrders.length} orders
                </span>
              </div>
              <div className="divide-y divide-rose-100 text-xs">
                {exceptions.unreconciledOrders.map((ord) => (
                  <div key={ord.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#7A1E3A]">Order #{ord.orderNumber}</p>
                      <p className="text-[11px] text-stone-600">
                        Customer: {ord.email} | Reason: <strong className="text-rose-700">{ord.reason}</strong>
                      </p>
                      <p className="font-semibold text-stone-800 mt-0.5">
                        Amount: {formatMoney({ amountMinor: ord.totalMinor, currency: ord.currency })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRetryOrder(ord.id, ord.orderNumber)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white font-medium rounded text-xs transition-colors"
                    >
                      Retry Reconciliation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Stalled Fulfillment Handoffs */}
          {exceptions?.stalledFulfillments && exceptions.stalledFulfillments.length > 0 && (
            <div className="bg-white rounded-xl border border-purple-200 overflow-hidden shadow-sm">
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-700" />
                  <h3 className="font-bold text-purple-900 text-xs uppercase tracking-wider">
                    Stalled Fulfillment Handoffs (Ready without Carrier Shipment)
                  </h3>
                </div>
                <span className="bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  {exceptions.stalledFulfillments.length} records
                </span>
              </div>
              <div className="divide-y divide-purple-100 text-xs">
                {exceptions.stalledFulfillments.map((s) => (
                  <div key={s.orderId} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-purple-900">Order #{s.orderNumber}</p>
                      <p className="text-[11px] text-stone-600">Handoff ID: {s.handoffId} ({s.handoffStatus})</p>
                    </div>
                    <span className="text-stone-400 font-mono text-[10px]">Created: {new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Failed Refunds */}
          {exceptions?.failedRefunds && exceptions.failedRefunds.length > 0 && (
            <div className="bg-white rounded-xl border border-blue-200 overflow-hidden shadow-sm">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-700" />
                  <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider">
                    Failed or Pending Refund Transactions
                  </h3>
                </div>
                <span className="bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  {exceptions.failedRefunds.length} returns
                </span>
              </div>
              <div className="divide-y divide-blue-100 text-xs">
                {exceptions.failedRefunds.map((r) => (
                  <div key={r.returnId} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-900">Return ID #{r.returnId}</p>
                      <p className="text-[11px] text-stone-600">Order ID: {r.orderId} | Status: {r.refundStatus}</p>
                    </div>
                    <span className="text-stone-400 font-mono text-[10px]">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Inventory Anomalies */}
          {exceptions?.inventoryAnomalies && exceptions.inventoryAnomalies.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-stone-700" />
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    Inventory Anomalies (Negative Stock or Hold Overflow)
                  </h3>
                </div>
                <span className="bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  {exceptions.inventoryAnomalies.length} products
                </span>
              </div>
              <div className="divide-y divide-stone-100 text-xs">
                {exceptions.inventoryAnomalies.map((anom) => (
                  <div key={anom.productId} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#2C221E]">{anom.productName}</p>
                      <p className="text-[11px] text-rose-700 font-medium">{anom.issue}</p>
                    </div>
                    <span className="text-stone-500 font-mono text-[11px]">On Hand: {anom.onHand} | Holds: {anom.activeReservations}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
