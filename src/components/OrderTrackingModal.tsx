import React, { useState } from 'react';
import { X, Search, PackageCheck, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { formatToman, formatUsd, toPersianDigits } from '../utils/formatters';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'toman' | 'usd';
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  currency,
}) => {
  if (!isOpen) return null;

  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCodeInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setTrackedOrder(null);

    try {
      const res = await fetch(`/api/orders/track/${trackingCodeInput.trim()}`);
      const data = await res.json();
      if (data.success) {
        setTrackedOrder(data.data);
      } else {
        setErrorMsg(data.message || 'سفارشی با این کد پیگیری پیدا نشد.');
      }
    } catch (err) {
      setErrorMsg('خطا در برقراری ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 1;
    }
  };

  const steps = [
    { label: 'ثبت سفارش', icon: Clock },
    { label: 'در حال پردازش', icon: PackageCheck },
    { label: 'تحویل پست / اکسپرس', icon: Truck },
    { label: 'تحویل گردید', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col relative animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-black text-stone-900">سامانه پیگیری لحظه‌ای سفارشات</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          <form onSubmit={handleTrack} className="space-y-3">
            <label className="text-xs font-bold text-stone-700 block">
              کد پیگیری سفارش خود را وارد کنید (مثلا: TRK-882910)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="TRK-XXXXXX"
                  value={trackingCodeInput}
                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {loading ? 'در حال استعلام...' : 'استعلام وضعیت'}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </p>
            )}
          </form>

          {/* Results Timeline */}
          {trackedOrder && (
            <div className="p-5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-stone-200">
                <div>
                  <span className="text-stone-400 block font-semibold">تحویل‌گیرنده:</span>
                  <span className="font-extrabold text-stone-900">{trackedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold">تاریخ ثبت:</span>
                  <span className="font-mono text-stone-800">
                    {new Date(trackedOrder.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>

              {/* Status Timeline Bar */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 block">مراحل پردازش سفارش:</span>
                <div className="grid grid-cols-4 gap-1 text-center pt-2">
                  {steps.map((st, i) => {
                    const currentIdx = getStatusStepIndex(trackedOrder.status);
                    const isDone = i <= currentIdx;
                    const IconComponent = st.icon;

                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                              : 'bg-stone-200 text-stone-400'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold ${isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ordered Items */}
              <div className="pt-3 border-t border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-700 block">اقلام سفارش:</span>
                <div className="divide-y divide-stone-200/60 max-h-40 overflow-y-auto pr-1">
                  {trackedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">
                        {item.titleFa} <span className="text-stone-400">× {toPersianDigits(item.quantity)}</span>
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {currency === 'toman'
                          ? formatToman(item.priceToman * item.quantity)
                          : formatUsd(Math.round((item.priceToman * item.quantity) / 62000))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
