import React, { useState, useEffect } from 'react';
import { X, Plus, Package, ShoppingCart, DollarSign, SlidersHorizontal, CheckCircle2, RefreshCw } from 'lucide-react';
import { Product, Order } from '../types';
import { formatToman, formatUsd, toPersianDigits } from '../utils/formatters';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'toman' | 'usd';
  onProductAdded: (p: Product) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  currency,
  onProductAdded,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // New product form
  const [titleFa, setTitleFa] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionFa, setDescriptionFa] = useState('');
  const [priceToman, setPriceToman] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [category, setCategory] = useState<'digital' | 'fashion' | 'home' | 'luxury' | 'beauty'>('digital');
  const [imageUrl, setImageUrl] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setLoadingOrders(true);
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFa || !priceToman) return;

    const categoryLabels: Record<string, string> = {
      digital: 'کالای دیجیتال',
      fashion: 'پوشاک و مد',
      home: 'خانه و دکوراسیون',
      luxury: 'ساعت و اکسسوری',
      beauty: 'آرایشی و بهداشتی',
    };

    const newProdPayload = {
      titleFa,
      titleEn: titleEn || titleFa,
      descriptionFa,
      priceToman: Number(priceToman),
      priceUsd: Number(priceUsd) || Math.round(Number(priceToman) / 62000),
      category,
      categoryLabelFa: categoryLabels[category] || 'کالای دیجیتال',
      image:
        imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      stock: 10,
      tags: ['جدید', 'فروشگاه'],
      isFeatured: true,
      isFlashSale,
      discountPercent: discountPercent ? Number(discountPercent) : 0,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProdPayload),
      });

      const data = await res.json();
      if (data.success) {
        onProductAdded(data.data);
        setSuccessMsg('محصول جدید با موفقیت به انبار فروشگاه افزوده شد!');
        setTitleFa('');
        setTitleEn('');
        setDescriptionFa('');
        setPriceToman('');
        setPriceUsd('');
        setImageUrl('');
        setDiscountPercent('');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenueToman = orders.reduce((acc, o) => acc + o.totalToman, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col relative animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black">داشبورد مدیریت فروشگاه</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block">مجموع فروش کل:</span>
                <span className="text-sm font-black text-stone-900">{formatToman(totalRevenueToman)}</span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block">تعداد سفارشات:</span>
                <span className="text-sm font-black text-stone-900">
                  {toPersianDigits(orders.length)} سفارش
                </span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block">وضعیت انبار:</span>
                <span className="text-sm font-black text-stone-900">بروزرسانی آنلاین</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 border-b border-stone-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                activeTab === 'products'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              افزودن محصول جدید
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              لیست آخرین سفارشات ({toPersianDigits(orders.length)})
            </button>
          </div>

          {/* Tab 1: Add Product Form */}
          {activeTab === 'products' && (
            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">عنوان فارسی محصول *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلا: هدفون بلوتوث لوکس"
                    value={titleFa}
                    onChange={(e) => setTitleFa(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">عنوان انگلیسی</label>
                  <input
                    type="text"
                    placeholder="e.g. Wireless Pro Headphone"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">قیمت به تومان *</label>
                  <input
                    type="number"
                    required
                    placeholder="15000000"
                    value={priceToman}
                    onChange={(e) => setPriceToman(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">قیمت به دلار ($)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">دسته‌بندی اصلی</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="digital">کالای دیجیتال</option>
                    <option value="luxury">ساعت و اکسسوری</option>
                    <option value="fashion">پوشاک و مد</option>
                    <option value="home">خانه و دکوراسیون</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">لینک عکس محصول (URL)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">درصد تخفیف (پیش‌فرض ۰)</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">توضیحات محصول</label>
                <textarea
                  rows={2}
                  placeholder="مشخصات و ویژگی‌های اصلی..."
                  value={descriptionFa}
                  onChange={(e) => setDescriptionFa(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت و انتشار محصول در فروشگاه</span>
              </button>
            </form>
          )}

          {/* Tab 2: Orders List */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <div key={o.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold border-b border-stone-200 pb-2">
                      <span className="font-mono text-amber-800">{o.trackingCode}</span>
                      <span className="text-stone-500">خرید توسط: {o.customerName} ({o.phone})</span>
                    </div>

                    <div className="flex justify-between items-center text-stone-600">
                      <span>آدرس: {o.address}</span>
                      <span className="font-black text-stone-900">
                        {currency === 'toman' ? formatToman(o.totalToman) : formatUsd(o.totalUsd)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-stone-400 py-8 italic">هنوز سفارشی ثبت نشده است.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
