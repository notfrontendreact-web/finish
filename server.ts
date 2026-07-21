import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { initialProducts, initialReviews, categoriesData } from './src/data/mockProducts.js';
import { Product, Order, Review } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory databases
let products: Product[] = [...initialProducts];
let reviews: Review[] = [...initialReviews];
let orders: Order[] = [
  {
    id: 'ord-1001',
    trackingCode: 'TRK-882910',
    items: [
      {
        productId: 'prod-1',
        titleFa: 'هدفون بی‌سیم پرچمدار نویزکنسلینگ',
        quantity: 1,
        priceToman: 18500000,
        selectedColor: 'مشکی مات',
      },
    ],
    totalToman: 18500000,
    totalUsd: 299,
    customerName: 'علی محمدی',
    phone: '09123456789',
    address: 'تهران، خیابان ولیعصر، پلاک ۱۲۴',
    city: 'تهران',
    postalCode: '1987654321',
    status: 'shipped',
    paymentMethod: 'online',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Initialize Gemini AI Client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Gemini client initialization failed:', e);
    }
  }
  return aiClient;
}

// ================= API ENDPOINTS =================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET categories
app.get('/api/categories', (req: Request, res: Response) => {
  res.json({ success: true, data: categoriesData });
});

// GET products (with filters & search & sorting)
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy, flashSale, featured } = req.query;

    let filtered = [...products];

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (flashSale === 'true') {
      filtered = filtered.filter((p) => p.isFlashSale);
    }

    if (featured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.titleFa.toLowerCase().includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.descriptionFa.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      filtered = filtered.filter((p) => p.priceToman >= Number(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter((p) => p.priceToman <= Number(maxPrice));
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.priceToman - b.priceToman);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.priceToman - a.priceToman);
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      // default: newest or featured first
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error listing products' });
  }
});

// GET product by ID
app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'محصول پیدا نشد' });
  }
  res.json({ success: true, data: product });
});

// POST new product (Admin)
app.post('/api/products', (req: Request, res: Response) => {
  try {
    const newProduct: Product = {
      ...req.body,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
    };
    products.unshift(newProduct);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: 'داده‌های محصول نامعتبر است' });
  }
});

// GET reviews for product
app.get('/api/reviews/:productId', (req: Request, res: Response) => {
  const prodReviews = reviews.filter((r) => r.productId === req.params.productId);
  res.json({ success: true, data: prodReviews });
});

// POST new review
app.post('/api/reviews', (req: Request, res: Response) => {
  const { productId, userName, rating, comment } = req.body;
  if (!productId || !userName || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'اطلاعات کامل نیست' });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    userName,
    rating: Number(rating),
    comment,
    date: new Date().toLocaleDateString('fa-IR'),
    verifiedPurchase: true,
  };

  reviews.unshift(newReview);

  // Update product average rating
  const prod = products.find((p) => p.id === productId);
  if (prod) {
    const prodRevs = reviews.filter((r) => r.productId === productId);
    const avg = prodRevs.reduce((acc, r) => acc + r.rating, 0) / prodRevs.length;
    prod.rating = Number(avg.toFixed(1));
    prod.reviewsCount = prodRevs.length;
  }

  res.status(201).json({ success: true, data: newReview });
});

// POST Create Order
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { items, customerName, phone, address, city, postalCode, paymentMethod, discountCode } = req.body;

    if (!items || items.length === 0 || !customerName || !phone || !address) {
      return res.status(400).json({ success: false, message: 'اطلاعات گیرنده یا سبد خرید ناقص است' });
    }

    let rawTotal = 0;
    const orderItems = items.map((item: any) => {
      const p = products.find((prod) => prod.id === item.productId);
      const unitPrice = p ? p.priceToman * (p.discountPercent ? (100 - p.discountPercent) / 100 : 1) : 0;
      rawTotal += unitPrice * item.quantity;
      return {
        productId: item.productId,
        titleFa: item.product?.titleFa || p?.titleFa || 'محصول سفارش داده شده',
        quantity: item.quantity,
        priceToman: unitPrice,
        selectedColor: item.selectedColor?.nameFa,
        selectedSize: item.selectedSize,
      };
    });

    let discountAmount = 0;
    if (discountCode === 'WELCOME10') {
      discountAmount = rawTotal * 0.1;
    } else if (discountCode === 'OFF20') {
      discountAmount = rawTotal * 0.2;
    }

    const finalTotal = Math.max(0, rawTotal - discountAmount);
    const trackingCode = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      trackingCode,
      items: orderItems,
      totalToman: Math.round(finalTotal),
      totalUsd: Math.round(finalTotal / 62000),
      customerName,
      phone,
      address,
      city: city || 'تهران',
      postalCode: postalCode || '1000000000',
      status: 'processing',
      paymentMethod: paymentMethod || 'online',
      createdAt: new Date().toISOString(),
      discountCode: discountCode || undefined,
      discountAmountToman: discountAmount || undefined,
    };

    orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطا در ثبت سفارش' });
  }
});

// GET Track Order
app.get('/api/orders/track/:code', (req: Request, res: Response) => {
  const code = req.params.code.trim().toUpperCase();
  const order = orders.find((o) => o.trackingCode.toUpperCase() === code || o.id === code);

  if (!order) {
    return res.status(404).json({ success: false, message: 'سفارشی با این کد پیگیری یافت نشد' });
  }

  res.json({ success: true, data: order });
});

// GET All Orders (Admin)
app.get('/api/orders', (req: Request, res: Response) => {
  res.json({ success: true, count: orders.length, data: orders });
});

// POST AI Shopping Assistant (Gemini API Integration)
app.post('/api/ai-assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, userBudgetToman } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'لطفا سوال یا درخواست خود را وارد کنید' });
    }

    const client = getGeminiClient();

    const productSummary = products
      .map(
        (p) =>
          `• [شناسه: ${p.id}] ${p.titleFa} - دسته: ${p.categoryLabelFa} - قیمت: ${p.priceToman.toLocaleString(
            'fa-IR'
          )} تومان - ویژگی: ${p.descriptionFa.slice(0, 80)}...`
      )
      .join('\n');

    if (!client) {
      // Smart Fallback AI response if API key is not configured yet
      const matchedProducts = products.filter((p) => {
        const text = (p.titleFa + ' ' + p.descriptionFa + ' ' + p.categoryLabelFa).toLowerCase();
        const pQuery = prompt.toLowerCase();
        return (
          pQuery.split(' ').some((word) => word.length > 2 && text.includes(word)) ||
          (userBudgetToman && p.priceToman <= userBudgetToman)
        );
      });

      const selected = matchedProducts.length > 0 ? matchedProducts.slice(0, 3) : products.slice(0, 3);

      return res.json({
        success: true,
        reply: `سلام! من دستیار هوشمند فروشگاه هستم. با توجه به درخواست شما («${prompt}»)، این محصولات پیشنهادی ویژه برای شماست:`,
        recommendedProductIds: selected.map((s) => s.id),
      });
    }

    const systemInstruction = `شما دستیار خریدهوشمند، مؤدب، مجرب و راهنمای فروشگاه آنلاین لاکچری هستید.
پاسخ‌های شما باید کاملاً به زبان فارسی صمیمی و حرفه‌ای باشد.
لیست محصولات موجود فروشگاه:
${productSummary}

وظایف شما:
۱. راهنمایی دقیق کاربر با توجه به بودجه، سلیقه و سوال او.
۲. پیشنهاد ۱ تا ۳ محصول خاص از لیست فوق همراه با دلایل خرید.
۳. در انتهای پاسخ حتما کدهای شناسه محصولات پیشنهادی را به این فرمت دقیق اضافه کنید: [RECOMMENDED: prod-1, prod-2]`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const aiText = response.text || '';
    const match = aiText.match(/\[RECOMMENDED:\s*([^\]]+)\]/);
    let recommendedProductIds: string[] = [];

    if (match && match[1]) {
      recommendedProductIds = match[1]
        .split(',')
        .map((id) => id.trim())
        .filter((id) => products.some((p) => p.id === id));
    }

    // Clean text of recommendation tag
    const cleanReply = aiText.replace(/\[RECOMMENDED:\s*([^\]]+)\]/, '').trim();

    res.json({
      success: true,
      reply: cleanReply,
      recommendedProductIds,
    });
  } catch (error: any) {
    console.error('AI Assistant endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ارتباط با دستیار هوشمند',
      reply: 'در حال حاضر ارتباط با هوش مصنوعی برقرار نشد، اما پیشنهاد می‌کنیم محصولات پرفروش بالای صفحه را بررسی کنید.',
      recommendedProductIds: ['prod-1', 'prod-3', 'prod-5'],
    });
  }
});

// ================= VITE / STATIC SERVING =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
