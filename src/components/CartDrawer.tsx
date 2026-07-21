import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { formatToman, formatUsd, toPersianDigits } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: 'toman' | 'usd';
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: (appliedDiscountCode?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Calculations
  const rawSubtotalToman = cartItems.reduce((sum, item) => {
    const p = item.product;
    const unitPrice = p.priceToman * (p.discountPercent ? (100 - p.discountPercent) / 100 : 1);
    return sum + unitPrice * item.quantity;
  }, 0);

  const rawSubtotalUsd = cartItems.reduce((sum, item) => {
    const p = item.product;
    const unitPrice = p.priceUsd * (p.discountPercent ? (100 - p.discountPercent) / 100 : 1);
    return sum + unitPrice * item.quantity;
  }, 0);

  const promoDiscountAmountToman = appliedPromo ? (rawSubtotalToman * appliedPromo.percent) / 100 : 0;
  const promoDiscountAmountUsd = appliedPromo ? Math.round((rawSubtotalUsd * appliedPromo.percent) / 100) : 0;

  const shippingFeeToman = rawSubtotalToman >= 2000000 || cartItems.length === 0 ? 0 : 75000;
  const shippingFeeUsd = rawSubtotalUsd >= 50 || cartItems.length === 0 ? 0 : 5;

  const finalTotalToman = Math.max(0, rawSubtotalToman - promoDiscountAmountToman + shippingFeeToman);
  const finalTotalUsd = Math.max(0, rawSubtotalUsd - promoDiscountAmountUsd + shippingFeeUsd);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'WELCOME10') {
      setAppliedPromo({ code: 'WELCOME10', percent: 10 });
    } else if (code === 'OFF20') {
      setAppliedPromo({ code: 'OFF20', percent: 20 });
    } else {
      setPromoError('کد تخفیف وارد شده معتبر نیست. (کدهای معتبر: WELCOME10 و OFF20)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-r border-stone-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-stone-900">سبد خرید شما</h2>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                {toPersianDigits(cartItems.length)} کالا
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items Scroll Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-stone-100">
            {cartItems.length > 0 ? (
              cartItems.map((item) => {
                const p = item.product;
                const unitPriceToman = p.priceToman * (p.discountPercent ? (100 - p.discountPercent) / 100 : 1);
                const unitPriceUsd = p.priceUsd * (p.discountPercent ? (100 - p.discountPercent) / 100 : 1);

                return (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 items-center">
                    <img
                      src={p.image}
                      alt={p.titleFa}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-xs font-black text-stone-900 line-clamp-1">{p.titleFa}</h3>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        {item.selectedColor && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-stone-300"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.nameFa}
                          </span>
                        )}
                        {item.selectedSize && <span>| سایز: {toPersianDigits(item.selectedSize)}</span>}
                      </div>

                      <div className="text-xs font-black text-stone-900 pt-1">
                        {currency === 'toman'
                          ? formatToman(unitPriceToman * item.quantity)
                          : formatUsd(Math.round(unitPriceUsd * item.quantity))}
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{toPersianDigits(item.quantity)}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="حذف از سبد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-stone-800">سبد خرید شما خالی است</h3>
                  <p className="text-xs text-stone-400">محصولات مورد علاقه خود را انتخاب کرده و به سبد اضافه کنید.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/80 space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="کد تخفیف (مثلا WELCOME10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs uppercase font-mono font-bold text-stone-900"
                    />
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    اعمال
                  </button>
                </div>

                {appliedPromo && (
                  <p className="text-[11px] text-emerald-700 font-bold">
                    کد {appliedPromo.code} با موفقیت اعمال شد ({toPersianDigits(appliedPromo.percent)}٪ تخفیف)
                  </p>
                )}
                {promoError && <p className="text-[11px] text-rose-600 font-semibold">{promoError}</p>}
              </form>

              {/* Price Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>جمع کل کالاهـا:</span>
                  <span className="font-bold">
                    {currency === 'toman' ? formatToman(rawSubtotalToman) : formatUsd(Math.round(rawSubtotalUsd))}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>تخفیف ویژه ({toPersianDigits(appliedPromo.percent)}٪):</span>
                    <span>
                      -
                      {currency === 'toman'
                        ? formatToman(promoDiscountAmountToman)
                        : formatUsd(promoDiscountAmountUsd)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>هزینه ارسال اکسپرس:</span>
                  <span className="font-bold">
                    {shippingFeeToman === 0 ? (
                      <span className="text-emerald-600 font-bold">رایگان</span>
                    ) : currency === 'toman' ? (
                      formatToman(shippingFeeToman)
                    ) : (
                      formatUsd(shippingFeeUsd)
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-black text-stone-900">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-base text-amber-700">
                    {currency === 'toman' ? formatToman(finalTotalToman) : formatUsd(finalTotalUsd)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => onProceedToCheckout(appliedPromo?.code)}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>ادامه فرآیند خرید</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>پرداخت امن شتابی با ضمانت بازگشت وجه ۷ روزه</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
