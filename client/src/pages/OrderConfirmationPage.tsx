import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Clock, ShieldCheck, RefreshCw, XCircle } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('accessToken');

  const [order, setOrder] = useState<any | null>(null);
  const [shipment, setShipment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/v1/orders/${id}?accessToken=${accessToken}`);
      if (!res.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await res.json();
      setOrder(data);
      
      // Try to fetch shipment
      try {
        const shipRes = await fetch(`/api/v1/orders/${id}/shipment?accessToken=${accessToken}`);
        if (shipRes.ok) {
          const shipData = await shipRes.json();
          setShipment(shipData);
        }
      } catch(e) {
        // Shipment might not exist yet
      }

    } catch (err: any) {
      setError(err.message || 'Unable to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && accessToken) {
      fetchOrder();
    } else {
      setError('Invalid order link');
      setLoading(false);
    }
  }, [id, accessToken]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/v1/orders/${id}/cancel?accessToken=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Customer requested cancellation via confirmation page' })
      });
      if (!res.ok) {
        throw new Error('Failed to cancel order');
      }
      const data = await res.json();
      setOrder(data);
      alert('Order cancelled successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const formatMoney = (minor: string, currency: string) => {
    const value = parseInt(minor, 10) / 100;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#C28E46] animate-spin" />
        <p className="text-stone-500 font-serif">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#2C221E]">Order Not Found</h2>
        <p className="text-xs text-stone-500">{error}</p>
        <Link
          to="/collections/all"
          className="inline-block bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-6 py-3 rounded-xl"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const isCancellable = order.status === 'CONFIRMED' || order.status === 'PROCESSING';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 shadow-xl ${order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-[#2E6F40]/10 text-[#2E6F40] border-[#2E6F40]/30'}`}>
        {order.status === 'CANCELLED' ? <XCircle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C28E46]">
          {order.status === 'CANCELLED' ? 'Order Cancelled' : 'Order Confirmed'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
          {order.status === 'CANCELLED' ? 'Your order has been cancelled.' : 'Thank You for Choosing SareeElegance!'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Your reference number is <strong className="text-[#2C221E] font-mono">{order.orderNumber}</strong>. 
          {order.status !== 'CANCELLED' && ' A confirmation email has been dispatched.'}
        </p>
      </div>

      {shipment && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm text-left max-w-xl mx-auto space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#2C221E] border-b border-[#F3EFE6] pb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#C28E46]" /> Shipment Tracking
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
              <span className="text-stone-500">Status</span>
              <span className="font-bold text-[#2C221E]">{shipment.status}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
              <span className="text-stone-500">Carrier</span>
              <span className="font-bold text-[#2C221E]">{shipment.provider}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
              <span className="text-stone-500">Tracking Number</span>
              <span className="font-bold text-[#2C221E]">{shipment.trackingNumber || 'Pending'}</span>
            </div>
            {shipment.dispatchedAt && (
              <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
                <span className="text-stone-500">Dispatched At</span>
                <span className="font-bold text-[#2C221E]">{new Date(shipment.dispatchedAt).toLocaleString()}</span>
              </div>
            )}
            {shipment.deliveredAt && (
              <div className="flex justify-between border-b border-[#F3EFE6] pb-2">
                <span className="text-stone-500">Delivered At</span>
                <span className="font-bold text-[#2C221E]">{new Date(shipment.deliveredAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Box */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm text-left max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-3 text-xs">
          <div>
            <span className="text-stone-400 block">Date</span>
            <strong className="text-[#2C221E]">{new Date(order.createdAt).toLocaleDateString()}</strong>
          </div>
          <div>
            <span className="text-stone-400 block">Status</span>
            <strong className={`${order.status === 'CANCELLED' ? 'text-red-600' : 'text-[#2E6F40]'}`}>
              {order.status}
            </strong>
          </div>
          <div>
            <span className="text-stone-400 block">Email</span>
            <strong className="text-[#2C221E]">{order.email}</strong>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {order.lines.map((it: any) => (
            <div key={it.id} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex-1">
                <h5 className="font-serif font-bold text-[#2C221E]">{it.name}</h5>
                <p className="text-[10px] text-stone-500">Qty: {it.quantity} • SKU: {it.sku}</p>
              </div>
              <span className="font-bold text-[#2C221E]">{formatMoney(it.lineSubtotal.amountMinor, it.lineSubtotal.currency)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-[#F3EFE6] pt-3 text-xs text-stone-600">
           <div className="flex justify-between">
             <span>Subtotal</span>
             <span>{formatMoney(order.productSubtotal.amountMinor, order.productSubtotal.currency)}</span>
           </div>
           <div className="flex justify-between">
             <span>Shipping</span>
             <span>{formatMoney(order.shipping.amountMinor, order.shipping.currency)}</span>
           </div>
           <div className="flex justify-between">
             <span>Tax</span>
             <span>{formatMoney(order.tax.amountMinor, order.tax.currency)}</span>
           </div>
        </div>

        <div className="border-t border-[#F3EFE6] pt-3 flex justify-between items-center text-sm font-bold text-[#2C221E]">
          <span>Total</span>
          <span className="text-base text-[#2C221E]">{formatMoney(order.total.amountMinor, order.total.currency)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        {isCancellable && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="text-red-600 font-bold text-xs px-6 py-3.5 rounded-xl border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
        <Link
          to="/collections/all"
          className="bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-6 py-3.5 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors shadow-md"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};