import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { returnsApi } from '../api/returns.api';
import { ReturnRequestDto } from '../../../../../shared/contracts/returns/return';
import { Order } from '@/types';

interface ReturnModalProps {
  order: Order;
  onClose: () => void;
  accessToken: string; // Since PR 11.1 we need an access token, assuming it's available or mocked
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ order, onClose, accessToken }) => {
  const { addToast, formatPrice } = useStore();
  const [existingReturns, setExistingReturns] = useState<ReturnRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLines, setSelectedLines] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');

  useEffect(() => {
    returnsApi.getReturns(order.orderId, accessToken)
      .then(res => {
        setExistingReturns(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        // If it's a mocked order without server backend, just fail silently or mock
      });
  }, [order.orderId, accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const linesToReturn = Object.entries(selectedLines)
      .filter(([_, qty]) => qty > 0)
      .map(([id, quantity]) => ({ orderLineId: id, quantity, reason }));

    if (linesToReturn.length === 0) {
      addToast('Please select at least one item to return', 'error');
      return;
    }

    if (!reason.trim()) {
      addToast('Please provide a reason for the return', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await returnsApi.createReturn(order.orderId, {
        reason,
        lines: linesToReturn
      }, accessToken);
      addToast('Return request submitted successfully', 'success');
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to submit return request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQtyChange = (itemId: string, maxQty: number, val: string) => {
    let qty = parseInt(val, 10);
    if (isNaN(qty) || qty < 0) qty = 0;
    if (qty > maxQty) qty = maxQty;
    setSelectedLines(prev => ({ ...prev, [itemId]: qty }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full border-2 border-[#C28E46] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between border-b border-[#E6DFC6] pb-4">
          <h3 className="font-serif text-xl font-bold text-[#2C221E]">Return Items</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-200">
            <X className="w-5 h-5 text-stone-700" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-[#C28E46]" />
          </div>
        ) : (
          <div className="space-y-6">
            {existingReturns.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-[#E6DFC6] space-y-3">
                <h4 className="font-bold text-sm text-[#2C221E]">Existing Returns</h4>
                {existingReturns.map(r => (
                  <div key={r.id} className="flex justify-between items-center bg-[#FAF7F2] p-3 rounded border border-[#E6DFC6]">
                    <div>
                      <span className="text-xs font-mono text-stone-500">Ref: {r.id.split('-')[0]}</span>
                      <div className="text-sm font-bold mt-1 text-[#2C221E]">Status: {r.status}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-stone-500 block">Refund</span>
                      <span className="text-sm font-bold text-[#C28E46]">
                        {r.refundAmountMinor ? formatPrice(Number(r.refundAmountMinor)/100) : 'Pending'}
                      </span>
                      <div className="text-[10px] uppercase font-bold text-emerald-600 mt-1">{r.refundStatus}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-[#2C221E]">Select Items to Return</h4>
                {order.items.map(item => {
                  const returnedQty = existingReturns.reduce((acc, req) => {
                    const line = req.lines.find(l => l.orderLineId === item.id);
                    return acc + (line ? line.quantity : 0);
                  }, 0);
                  const availableToReturn = item.quantity - returnedQty;

                  return (
                    <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl border border-[#E6DFC6]">
                      <img src={item.product.images[0]} alt={item.product.title} className="w-16 h-20 object-cover rounded" />
                      <div className="flex-1 space-y-1">
                        <h5 className="font-bold text-sm text-[#2C221E]">{item.product.title}</h5>
                        <p className="text-xs text-stone-500">Purchased: {item.quantity} | Available to return: {availableToReturn}</p>
                      </div>
                      {availableToReturn > 0 ? (
                        <div className="w-24">
                          <label className="text-[10px] font-bold text-stone-500">Qty to return</label>
                          <input 
                            type="number" 
                            min="0" 
                            max={availableToReturn}
                            value={selectedLines[item.id] || ''}
                            onChange={e => handleQtyChange(item.id, availableToReturn, e.target.value)}
                            className="w-full p-2 border border-[#E6DFC6] rounded bg-[#FAF7F2] text-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-24 flex items-center justify-end text-xs text-stone-400">
                          Returned
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm text-[#2C221E]">Reason for Return</label>
                <textarea 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Please describe why you are returning the item(s)..."
                  className="w-full p-3 border border-[#E6DFC6] rounded-xl bg-white text-sm"
                  rows={3}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
              >
                {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Submit Return Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
