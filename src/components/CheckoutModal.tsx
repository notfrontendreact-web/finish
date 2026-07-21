import React, { useState } from 'react';
import { X, CheckCircle2, Copy, ShieldCheck, CreditCard, Truck, ArrowRight, Loader2 } from 'lucide-react';
import { CartItem, Order } from '../types';
import { formatToman, formatUsd, toPersianDigits } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: 'toman' | 'usd';
  discountCode?: string;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  discountCode,
  onOrderCompleted,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('تهران');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('لطفاً تمامی فیلدهای ضروری (نام، تلفن، آدرس) را تکمیل کنید.');
      return;
    }

    setStep('processing');
    setErrorMsg('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
            product: item.product,
          })),
          customerName,
          phone,
          address,
          city,
          postalCode,
          paymentMethod,
          discountCode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCompletedOrder(data.data);
        setStep('success');
        onOrderCompleted();
      } else {
        setErrorMsg(data.message || 'خطا در انجام ثبت سفارش');
        setStep('form');
      }
    } catch (err) {
      setErrorMsg('خطا در ارتباط با سرور. لطفاً مجددا سعی کنید.');
      setStep('form');
    }
  };

  const handleCopyTrackingCode = () => {
    if (completedOrder?.trackingCode) {
      navigator.clipboard.writeText(completedOrder.trackingCode);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col relative animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <h2 className="text-base font-black text-stone-900">
            {step === 'success' ? 'ثبت موفق سفارش' : 'تکمیل اطلاعات ارسال و پرداخت'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              {errorMsg}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  ۱. اطلاعات تحویل‌گیرنده
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      نام و نام خانوادگی <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثلا: علی رضایی"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      شماره همراه <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09121234567"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">شهر / استان</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="مثلا: تهران"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">کد پستی ۱۰ رقمی</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="1234567890"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    آدرس کامل پستی <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="خیابان، کوچه، پلاک، واحد..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  ۲. شیوه پرداخت
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setPaymentMethod('online')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'online'
                        ? 'border-amber-500 bg-amber-50/50 text-stone-900 shadow-xs'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="text-xs font-extrabold">درگاه آنلاین شتاب</h4>
                      <p className="text-[10px] text-stone-400">پرداخت امن با کلیه کارت‌های بانکی</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-amber-500 bg-amber-50/50 text-stone-900 shadow-xs'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="text-xs font-extrabold">پرداخت نقد در محل</h4>
                      <p className="text-[10px] text-stone-400">تحویل سفارشی و پرداخت درب منزل</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>تایید نهایی و پرداخت</span>
                <ShieldCheck className="w-5 h-5" />
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-stone-800">در حال اتصال به درگاه امن و ثبت سفارش...</h3>
              <p className="text-xs text-stone-400">لطفاً شکیبا باشید و صفحه را نبندید.</p>
            </div>
          )}

          {step === 'success' && completedOrder && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-stone-900">سفارش شما با موفقیت ثبت شد!</h3>
                <p className="text-xs text-stone-500">
                  کد پیگیری اختصصی سفارش شما صادر شد. می‌توانید در هر لحظه وضعیت آن را پیگیری کنید.
                </p>
              </div>

              {/* Tracking Code Box */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl flex items-center justify-between border border-stone-800 max-w-md mx-auto">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 font-bold block">کد پیگیری اختصاصی:</span>
                  <span className="text-lg font-mono font-black text-amber-400 tracking-wider">
                    {completedOrder.trackingCode}
                  </span>
                </div>

                <button
                  onClick={handleCopyTrackingCode}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedTracking ? 'کپی شد!' : 'کپی کد'}</span>
                </button>
              </div>

              {/* Summary Details */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-right text-xs space-y-2">
                <div className="flex justify-between font-bold">
                  <span>تحویل‌گیرنده:</span>
                  <span>{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>آدرس ارسال:</span>
                  <span className="line-clamp-1">{completedOrder.address}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-800">
                  <span>مبلغ کل پرداخت شده:</span>
                  <span>
                    {currency === 'toman'
                      ? formatToman(completedOrder.totalToman)
                      : formatUsd(completedOrder.totalUsd)}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-sm shadow-md transition-all cursor-pointer"
              >
                بازگشت به فروشگاه
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
