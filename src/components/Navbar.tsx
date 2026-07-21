import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  Bot,
  PackageCheck,
  ShieldAlert,
  Sparkles,
  DollarSign,
  Coins,
  Menu,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Product } from '../types';
import { formatToman, formatUsd, toPersianDigits } from '../utils/formatters';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  currency: 'toman' | 'usd';
  setCurrency: (c: 'toman' | 'usd') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrderTracker: () => void;
  onOpenAIAssistant: () => void;
  onOpenAdmin: () => void;
  allProducts: Product[];
  onSelectProduct: (p: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  currency,
  setCurrency,
  searchQuery,
  setSearchQuery,
  onOpenCart,
  onOpenWishlist,
  onOpenOrderTracker,
  onOpenAIAssistant,
  onOpenAdmin,
  allProducts,
  onSelectProduct,
}) => {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchResults = searchQuery.trim()
    ? allProducts
        .filter(
          (p) =>
            p.titleFa.includes(searchQuery) ||
            p.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some((t) => t.includes(searchQuery))
        )
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs transition-all">
      {/* Top Notification Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-between max-w-7xl mx-auto">
        <div className="hidden md:flex items-center gap-2 text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>ارسال رایگان برای خریدهای بالای ۲ میلیون تومان</span>
        </div>
        <div className="mx-auto md:mx-0 flex items-center gap-3">
          <span className="text-amber-300 font-semibold">کد تخفیف ویژه: WELCOME10</span>
          <span className="text-stone-500">|</span>
          <button
            onClick={onOpenAIAssistant}
            className="text-amber-200 hover:text-amber-100 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>مشاوره تخصصی با هوش مصنوعی</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            aria-label="منو"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-stone-900 via-stone-800 to-amber-800 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-stone-900 tracking-tight leading-tight">
                فروشگاه شیک
              </span>
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">
                Sheek Luxury Store
              </span>
            </div>
          </a>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg relative">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="جستجو در بین کل محصولات، برندها و دسته‌ها..."
              className="w-full pl-10 pr-11 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
            />
            <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div
              className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowSearchDropdown(false)}
            >
              <div className="p-3 text-xs font-bold text-stone-500 bg-stone-50 border-b border-stone-100">
                نتایج جستجو ({toPersianDigits(searchResults.length)} مورد)
              </div>
              <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-right p-3 hover:bg-amber-50/60 flex items-center gap-3 transition-colors group"
                  >
                    <img
                      src={product.image}
                      alt={product.titleFa}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-stone-100 border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-stone-800 truncate group-hover:text-amber-800">
                        {product.titleFa}
                      </h4>
                      <p className="text-xs text-stone-500 truncate">{product.titleEn}</p>
                    </div>
                    <div className="text-left font-bold text-xs text-stone-900">
                      {currency === 'toman' ? formatToman(product.priceToman) : formatUsd(product.priceUsd)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Toggle */}
          <button
            onClick={() => setCurrency(currency === 'toman' ? 'usd' : 'toman')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            title="تغییر واحد پول"
          >
            {currency === 'toman' ? (
              <>
                <Coins className="w-4 h-4 text-amber-600" />
                <span>تومان</span>
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>USD ($)</span>
              </>
            )}
          </button>

          {/* Order Track Button */}
          <button
            onClick={onOpenOrderTracker}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 text-xs font-bold transition-all cursor-pointer"
          >
            <PackageCheck className="w-4 h-4 text-stone-600" />
            <span>پیگیری سفارش</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAIAssistant}
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-bold text-xs shadow-md hover:shadow-lg hover:scale-102 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-200" />
            <span className="hidden sm:inline">دستیار خرید</span>
            <span className="bg-amber-900/40 text-amber-100 px-1.5 py-0.5 rounded-md text-[10px]">
              AI
            </span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="علاقه‌مندی‌ها"
          >
            <Heart className="w-5 h-5 text-stone-700" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[11px] font-bold flex items-center justify-center border-2 border-white">
                {toPersianDigits(wishlistCount)}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="hidden md:inline text-xs font-bold">سبد خرید</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 bg-amber-500 text-stone-950 rounded-full text-xs font-extrabold flex items-center justify-center">
                {toPersianDigits(cartCount)}
              </span>
            )}
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            className="p-2.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
            title="پنل مدیریت فروشگاه"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Search & Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی سریع محصولات..."
              className="w-full pr-10 pl-4 py-2 bg-white border border-stone-200 rounded-xl text-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => {
                onOpenOrderTracker();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4 text-stone-600" />
              <span>پیگیری سفارش</span>
            </button>
            <button
              onClick={() => {
                setCurrency(currency === 'toman' ? 'usd' : 'toman');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4 text-amber-600" />
              <span>واحد: {currency === 'toman' ? 'تومان' : 'دلار'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
