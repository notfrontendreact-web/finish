import React from 'react';
import { Star, Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { formatToman, formatUsd, toPersianDigits } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  currency: 'toman' | 'usd';
  isWishlisted: boolean;
  isInCart: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  isInCart,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
}) => {
  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  const discountedPriceToman = hasDiscount
    ? product.priceToman * ((100 - product.discountPercent!) / 100)
    : product.priceToman;

  const discountedPriceUsd = hasDiscount
    ? Math.round(product.priceUsd * ((100 - product.discountPercent!) / 100))
    : product.priceUsd;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Image Container */}
      <div className="relative aspect-4/3 bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={product.image}
          alt={product.titleFa}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-rose-600 text-white font-black text-[11px] px-2.5 py-1 rounded-lg shadow-md">
              {toPersianDigits(product.discountPercent!)}٪ تخفیف
            </span>
          )}
          {product.isFlashSale && (
            <span className="bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
              فروش ویژه
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 left-3 p-2 rounded-xl transition-all z-10 shadow-md cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-white/90 text-stone-500 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label="افزودن به علاقه‌مندی"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-stone-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>مشاهده جزییات</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {product.categoryLabelFa}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{toPersianDigits(product.rating)}</span>
              <span className="text-stone-400 text-[10px]">
                ({toPersianDigits(product.reviewsCount)})
              </span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-sm font-extrabold text-stone-900 hover:text-amber-800 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.titleFa}
          </h3>

          <p className="text-[11px] text-stone-400 truncate">{product.titleEn}</p>
        </div>

        {/* Colors dots preview if available */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-400 font-medium">رنگ‌ها:</span>
            <div className="flex items-center gap-1">
              {product.colors.map((c, i) => (
                <span
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
                  style={{ backgroundColor: c.hex }}
                  title={c.nameFa}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] text-stone-400 line-through">
                {currency === 'toman'
                  ? formatToman(product.priceToman)
                  : formatUsd(product.priceUsd)}
              </span>
            )}
            <span className="text-sm font-black text-stone-950">
              {currency === 'toman'
                ? formatToman(discountedPriceToman)
                : formatUsd(discountedPriceUsd)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold text-xs ${
              isInCart
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                : 'bg-stone-900 text-white hover:bg-amber-600 hover:shadow-md'
            }`}
            title={isInCart ? 'افزوده شد' : 'افزودن به سبد'}
          >
            {isInCart ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
