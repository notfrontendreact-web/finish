import React, { useState, useEffect } from 'react';
import {
  Filter,
  SlidersHorizontal,
  Flame,
  Star,
  ShoppingBag,
  Sparkles,
  Search,
  RotateCcw,
  X,
  Heart,
  Tag,
} from 'lucide-react';
import { Product, CartItem, Category, FilterOptions } from './types';
import { initialProducts, categoriesData } from './data/mockProducts';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { formatToman, formatUsd, toPersianDigits } from './utils/formatters';

export default function App() {
  // Products & Data State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(categoriesData);
  const [currency, setCurrency] = useState<'toman' | 'usd'>('toman');
  const [searchQuery, setSearchQuery] = useState('');

  // Local Storage persisted states
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheek_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sheek_wishlist');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2'];
    } catch {
      return ['prod-1', 'prod-2'];
    }
  });

  // Filter options state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(85000000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating'>('popular');
  const [flashSaleOnly, setFlashSaleOnly] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Modals visibility state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | undefined>(undefined);

  // Save cart & wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('sheek_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('sheek_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Fetch products from backend API
  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (maxPriceFilter < 85000000) queryParams.append('maxPrice', maxPriceFilter.toString());
      if (sortBy) queryParams.append('sortBy', sortBy);
      if (flashSaleOnly) queryParams.append('flashSale', 'true');

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.warn('Using client fallback filtering due to network status', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, maxPriceFilter, sortBy, flashSaleOnly]);

  // Client filtered list fallback for smooth reactivity
  const displayProducts = products.filter((p) => {
    if (inStockOnly && p.stock <= 0) return false;
    if (flashSaleOnly && !p.isFlashSale) return false;
    if (p.priceToman > maxPriceFilter) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.titleFa.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Cart operations
  const handleAddToCart = (
    product: Product,
    selectedColor?: { nameFa: string; hex: string },
    selectedSize?: string,
    quantity: number = 1
  ) => {
    const colorKey = selectedColor ? selectedColor.nameFa : 'def';
    const sizeKey = selectedSize || 'def';
    const cartItemId = `${product.id}-${colorKey}-${sizeKey}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            product,
            quantity,
            selectedColor: selectedColor || (product.colors ? product.colors[0] : undefined),
            selectedSize: selectedSize || (product.sizes ? product.sizes[0] : undefined),
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
  const featuredProduct = products.find((p) => p.isFeatured) || products[0];

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans dir-rtl antialiased flex flex-col selection:bg-amber-500 selection:text-stone-950">
      {/* Header / Navbar */}
      <Navbar
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlistIds.length}
        currency={currency}
        setCurrency={setCurrency}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        allProducts={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <HeroBanner
          categories={categories}
          activeCategory={selectedCategory}
          onSelectCategory={(id) => setSelectedCategory(id)}
          featuredProduct={featuredProduct}
          currency={currency}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        />

        {/* Catalog Section */}
        <section id="catalog" className="space-y-6 pt-4">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                <span className="text-stone-400 font-medium shrink-0">فیلتر دسته:</span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-stone-900 text-amber-400 font-extrabold shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  همه کالاها ({toPersianDigits(products.length)})
                </button>
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-stone-900 text-amber-400 font-extrabold shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {cat.nameFa}
                    </button>
                  ))}
              </div>

              {/* Sorting dropdown */}
              <div className="flex items-center gap-2 text-xs self-end md:self-auto shrink-0">
                <span className="text-stone-500 font-bold whitespace-nowrap">مرتب‌سازی:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-stone-800 font-bold px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="popular">محبوب‌ترین‌ها</option>
                  <option value="rating">بالاترین امتیاز</option>
                  <option value="price-asc">ارزان‌ترین به گران‌ترین</option>
                  <option value="price-desc">گران‌ترین به ارزان‌ترین</option>
                  <option value="newest">جدیدترین محصولات</option>
                </select>
              </div>
            </div>

            {/* Price Slider & Filter Toggles */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
              <div className="flex flex-wrap items-center gap-4">
                {/* Price Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-stone-500">سقف قیمت:</span>
                  <input
                    type="range"
                    min={5000000}
                    max={85000000}
                    step={1000000}
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-28 sm:w-40 accent-amber-500 cursor-pointer"
                  />
                  <span className="font-bold font-mono text-stone-900 bg-stone-100 px-2 py-1 rounded-lg">
                    {formatToman(maxPriceFilter)}
                  </span>
                </div>

                {/* Toggles */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={flashSaleOnly}
                    onChange={(e) => setFlashSaleOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>فقط تخفیف‌دارها</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-stone-700">فقط کالاهای موجود</span>
                </label>
              </div>

              {/* Active count badge */}
              <div className="text-stone-400 font-mono">
                نمایش {toPersianDigits(displayProducts.length)} محصول از {toPersianDigits(products.length)}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  isWishlisted={wishlistIds.includes(product.id)}
                  isInCart={cartItems.some((item) => item.product.id === product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-4 max-w-md mx-auto my-8">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-900">محصولی با این مشخصات یافت نشد</h3>
              <p className="text-xs text-stone-500">
                فیلتر قیمت یا جستجوی خود را تغییر دهید یا به دسته محصولات اصلی بازگردید.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setMaxPriceFilter(85000000);
                  setSearchQuery('');
                  setFlashSaleOnly(false);
                }}
                className="px-4 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 transition-colors"
              >
                بازنشانی فیلترها
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
      />

      {/* MODALS */}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        currency={currency}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={(promoCode) => {
          setAppliedDiscountCode(promoCode);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currency={currency}
        discountCode={appliedDiscountCode}
        onOrderCompleted={() => setCartItems([])}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        currency={currency}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        allProducts={products}
        currency={currency}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currency={currency}
        onProductAdded={(newP) => setProducts([newP, ...products])}
      />

      {/* Wishlist Modal */}
      {isWishlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-xl max-h-[85vh] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col relative">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h2 className="text-base font-black text-stone-900">لیست علاقه‌مندی‌های شما</h2>
              </div>
              <button
                onClick={() => setIsWishlistModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {wishlistedProducts.length > 0 ? (
                wishlistedProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3">
                    <img src={p.image} alt={p.titleFa} referrerPolicy="no-referrer" className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{p.titleFa}</h4>
                      <span className="text-xs font-black text-amber-700">
                        {currency === 'toman' ? formatToman(p.priceToman) : formatUsd(p.priceUsd)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsWishlistModalOpen(false);
                      }}
                      className="px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-xl"
                    >
                      مشاهده
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-stone-400 py-10 italic">هیچ کالایی در لیست علاقه‌مندی‌ها وجود ندارد.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
