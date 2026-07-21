export interface ProductSpec {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  priceToman: number;
  priceUsd: number;
  rating: number;
  reviewsCount: number;
  category: 'digital' | 'fashion' | 'home' | 'luxury' | 'beauty';
  categoryLabelFa: string;
  image: string;
  secondaryImages?: string[];
  tags: string[];
  stock: number;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  discountPercent?: number;
  colors?: { nameFa: string; hex: string }[];
  sizes?: string[];
  specs?: ProductSpec[];
}

export interface CartItem {
  id: string; // unique cart item id (product.id + color + size)
  product: Product;
  quantity: number;
  selectedColor?: { nameFa: string; hex: string };
  selectedSize?: string;
}

export interface OrderItem {
  productId: string;
  titleFa: string;
  quantity: number;
  priceToman: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  trackingCode: string;
  items: OrderItem[];
  totalToman: number;
  totalUsd: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentMethod: 'online' | 'cash';
  createdAt: string;
  discountCode?: string;
  discountAmountToman?: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Category {
  id: string;
  nameFa: string;
  nameEn: string;
  iconName: string;
  count: number;
  image: string;
}

export interface FilterOptions {
  category: string;
  search: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating';
  inStockOnly: boolean;
  flashSaleOnly: boolean;
}
