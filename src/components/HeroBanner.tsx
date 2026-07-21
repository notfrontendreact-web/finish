import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, ShieldCheck, Truck, Headphones, RotateCcw, Flame } from 'lucide-react';
import { Category, Product } from '../types';
import { formatToman, formatUsd, toPersianDigits } from '../utils/formatters';

interface HeroBannerProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
  featuredProduct?: Product;
  currency: 'toman' | 'usd';
  onSelectProduct: (p: Product) => void;
  onOpenAIAssistant: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  featuredProduct,
  currency,
  onSelectProduct,
  onOpenAIAssistant,
}) => {
  // Flash sale countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 mb-10">
      {/* Luxury Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-white shadow-2xl border border-stone-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12 relative z-10">
          {/* Content Left / Right in RTL */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>کالکشن جدید و ویژه سال ۱۴۰۳</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              تجربه‌ای بی‌نظیر از خرید آنلاین <span className="text-amber-400">کالاهای لوکس و مدرن</span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              مجموعه‌ای دست‌چین شده از برترین برندهای بین‌المللی با ضمانت ۱۰۰٪ اصالت کالا، ارسال فوری سراسری و مشاوره اختصاصی هوش مصنوعی.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onSelectCategory('digital')}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
              >
                <span>مشاهده محصولات ویژه</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAIAssistant}
                className="px-5 py-3.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>دستیار هوشمند انتخاب هدیه</span>
              </button>
            </div>

            {/* Flash Sale Countdown Bar */}
            <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                <Flame className="w-4 h-4 animate-bounce" />
                <span>زمان باقی‌مانده شگفت‌انگیز:</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-white dir-ltr">
                <div className="bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-lg text-amber-400">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span>:</span>
                <div className="bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-lg text-amber-400">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span>:</span>
                <div className="bg-stone-800 border border-stone-700 px-2.5 py-1 rounded-lg text-amber-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Product Preview */}
          {featuredProduct && (
            <div className="lg:col-span-5 flex justify-center">
              <div
                onClick={() => onSelectProduct(featuredProduct)}
                className="group relative bg-stone-800/60 border border-stone-700/80 rounded-2xl p-5 w-full max-w-sm hover:border-amber-500/50 transition-all cursor-pointer shadow-2xl hover:scale-102"
              >
                <div className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md z-10">
                  {toPersianDigits(featuredProduct.discountPercent || 15)}٪ تخفیف
                </div>

                <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-900 mb-4 border border-stone-700/50">
                  <img
                    src={featuredProduct.image}
                    alt={featuredProduct.titleFa}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {featuredProduct.categoryLabelFa}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {featuredProduct.titleFa}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-700/60">
                    <div className="flex flex-col">
                      <span className="text-xs text-stone-400 line-through">
                        {currency === 'toman'
                          ? formatToman(featuredProduct.priceToman * 1.15)
                          : formatUsd(Math.round(featuredProduct.priceUsd * 1.15))}
                      </span>
                      <span className="text-base font-black text-amber-400">
                        {currency === 'toman'
                          ? formatToman(featuredProduct.priceToman)
                          : formatUsd(featuredProduct.priceUsd)}
                      </span>
                    </div>

                    <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30">
                      خرید سریع
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">ارسال Express سراسری</h4>
            <p className="text-[11px] text-stone-500">تحویل سریع ۲۴ ساعته</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">ضمانت اصالت کالا</h4>
            <p className="text-[11px] text-stone-500">۱۰۰٪ اورجینال با گارانتی</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">پشتیبانی ۲۴/۷</h4>
            <p className="text-[11px] text-stone-500">مشاوره تخصص خریداران</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">۷ روز ضمانت تعویض</h4>
            <p className="text-[11px] text-stone-500">بازگشت بدون قید و شرط</p>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <span>دسته‌بندی‌های محبوب</span>
          </h2>
          <span className="text-xs text-stone-500 font-semibold">
            {toPersianDigits(categories.length - 1)} دسته‌بندی فعال
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`relative overflow-hidden rounded-2xl p-4 text-right transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-stone-900 border-stone-900 text-white shadow-lg scale-102'
                    : 'bg-white border-stone-200/90 text-stone-800 hover:border-stone-400 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      isActive ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {toPersianDigits(cat.count)} کالا
                  </span>
                </div>

                <h3 className="text-sm font-bold truncate">{cat.nameFa}</h3>
                <p
                  className={`text-[10px] font-mono mt-0.5 ${
                    isActive ? 'text-stone-400' : 'text-stone-400'
                  }`}
                >
                  {cat.nameEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
