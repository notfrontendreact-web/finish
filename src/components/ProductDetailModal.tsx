import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  MessageSquare,
  Send,
  User,
} from 'lucide-react';
import { Product, Review } from '../types';
import { formatToman, formatUsd, toPersianDigits } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  currency: 'toman' | 'usd';
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, color?: { nameFa: string; hex: string }, size?: string, qty?: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
}) => {
  if (!product) return null;

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  const allImages = [product.image, ...(product.secondaryImages || [])];

  useEffect(() => {
    setActiveImage(product.image);
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    setQuantity(1);

    // Fetch reviews
    fetch(`/api/reviews/${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReviews(data.data);
      })
      .catch(() => {});
  }, [product]);

  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  const discountedPriceToman = hasDiscount
    ? product.priceToman * ((100 - product.discountPercent!) / 100)
    : product.priceToman;
  const discountedPriceUsd = hasDiscount
    ? Math.round(product.priceUsd * ((100 - product.discountPercent!) / 100))
    : product.priceUsd;

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: newReviewName,
          rating: newReviewRating,
          comment: newReviewComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setNewReviewName('');
        setNewReviewComment('');
        setReviewSuccessMsg('دیدگاه شما با موفقیت ثبت شد!');
        setTimeout(() => setReviewSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col relative animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 divide-y divide-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Gallery Left / Right in RTL */}
            <div className="md:col-span-6 space-y-4">
              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
                <img
                  src={activeImage}
                  alt={product.titleFa}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {hasDiscount && (
                  <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-lg shadow-md">
                    {toPersianDigits(product.discountPercent!)}٪ تخفیف
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImage === img ? 'border-amber-500 scale-105' : 'border-stone-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="پیش‌نمایش" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Column */}
            <div className="md:col-span-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                  {product.categoryLabelFa}
                </span>
                <h2 className="text-2xl font-black text-stone-900 leading-snug mt-2">{product.titleFa}</h2>
                <p className="text-xs text-stone-400 font-medium">{product.titleEn}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{toPersianDigits(product.rating)}</span>
                </div>
                <span className="text-stone-300">|</span>
                <span className="text-stone-500">
                  {toPersianDigits(product.reviewsCount)} دیدگاه تایید شده
                </span>
                <span className="text-stone-300">|</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  موجود در انبار ({toPersianDigits(product.stock)} عدد)
                </span>
              </div>

              {/* Description */}
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{product.descriptionFa}</p>

              {/* Colors Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800 block">
                    انتخاب رنگ: <span className="text-amber-700">{selectedColor?.nameFa}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                          selectedColor?.nameFa === c.nameFa
                            ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                        <span>{c.nameFa}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800 block">
                    انتخاب سایز: <span className="text-amber-700">{selectedSize}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {product.sizes.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSize(s)}
                        className={`w-10 h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          selectedSize === s
                            ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {toPersianDigits(s)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Quantity & Actions */}
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-stone-400 font-medium">قیمت نهایی با تخفیف:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-stone-950">
                        {currency === 'toman'
                          ? formatToman(discountedPriceToman * quantity)
                          : formatUsd(discountedPriceUsd * quantity)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-stone-400 line-through">
                          {currency === 'toman'
                            ? formatToman(product.priceToman * quantity)
                            : formatUsd(product.priceUsd * quantity)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl p-1 bg-stone-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{toPersianDigits(quantity)}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onAddToCart(product, selectedColor, selectedSize, quantity);
                      onClose();
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>افزودن به سبد خرید</span>
                  </button>

                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isWishlisted
                        ? 'border-rose-300 bg-rose-50 text-rose-600'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs: Technical Specs & User Reviews */}
          <div className="pt-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-stone-200">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-sm font-extrabold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'specs'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                مشخصات فنی و ویژگی‌ها
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-sm font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'reviews'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                <span>نظرات خریداران</span>
                <span className="bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded-full font-mono">
                  {toPersianDigits(reviews.length)}
                </span>
              </button>
            </div>

            {/* Specs Tab */}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {product.specs && product.specs.length > 0 ? (
                  product.specs.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                      <span className="font-bold text-stone-500">{spec.key}:</span>
                      <span className="font-bold text-stone-900">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500 italic">مشخصات اختصاصی بیشتری ثیت نشده است.</p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Submit New Review */}
                <form onSubmit={handleAddReview} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>ثبت نظر خریدار</span>
                  </h4>

                  {reviewSuccessMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                      {reviewSuccessMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="نام و نام خانوادگی شما"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      required
                      className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />

                    {/* Star selection */}
                    <div className="flex items-center gap-2 bg-white px-3 py-2 border border-stone-200 rounded-xl">
                      <span className="text-xs font-bold text-stone-500">امتیاز:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            onClick={() => setNewReviewRating(s)}
                            className={`w-4 h-4 cursor-pointer transition-colors ${
                              s <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="تجربه شما درباره این محصول..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال نظر</span>
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-white border border-stone-200/80 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-stone-900">
                            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span>{rev.userName}</span>
                          </div>
                          <span className="text-stone-400 text-[11px]">{rev.date}</span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400 text-xs italic text-center py-4">
                      هنوز نظری ثبت نشده است. اولین خریدار باشید!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
