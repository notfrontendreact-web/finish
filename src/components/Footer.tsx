import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, Truck, Headphones, Sparkles, Send } from 'lucide-react';

interface FooterProps {
  onOpenAIAssistant: () => void;
  onOpenOrderTracker: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAIAssistant, onOpenOrderTracker }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-black">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white">فروشگاه آنلاین شیک</span>
                <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">
                  Sheek Luxury E-Commerce
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              ارائه‌دهنده لوکس‌ترین کالاهای دیجیتال، اکسسوری و پوشاک با تضمین ۱۰۰٪ اصالت، ارسال فوری سراسری و مشاوره تخصصی هوش مصنوعی.
            </p>

            <button
              onClick={onOpenAIAssistant}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>گفتگو با دستیار هوشمند انتخاب کالا</span>
            </button>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={onOpenOrderTracker} className="hover:text-amber-400 transition-colors cursor-pointer">
                  پیگیری آنلاین سفارشات
                </button>
              </li>
              <li>
                <a href="#catalog" className="hover:text-amber-400 transition-colors">
                  جدیدترین محصولات
                </a>
              </li>
              <li>
                <a href="#catalog" className="hover:text-amber-400 transition-colors">
                  فروش شگفت‌انگیز
                </a>
              </li>
              <li>
                <button onClick={onOpenAIAssistant} className="hover:text-amber-400 transition-colors cursor-pointer">
                  مشاوره خرید با هوش مصنوعی
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">عضویت در خبرنامه تخفیف‌ها</h4>
            <p className="text-xs text-stone-400">
              برای دریافت کدهای تخفیف اختصاصی و مطلع شدن از حراج‌های بزرگ ایمیل خود را وارد کنید.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="ایمیل خود را وارد کنید..."
                className="flex-1 px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© ۱۴۰۳ تمامی حقوق برای فروشگاه آنلاین شیک محفوظ است.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>ضمانت اصالت کالا</span>
            <span>•</span>
            <span>ارسال اکسپرس</span>
            <span>•</span>
            <span>پشتیبانی شبانه‌روزی</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
