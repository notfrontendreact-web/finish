/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // این خط برای ساخت خروجی استاتیک ضروری است
  images: {
    unoptimized: true, // گیت‌هاب پیجز از بهینه‌سازی تصویر گیت‌هاب پشتیبانی نمی‌کند
  },
  // ⚠️ نکته مهم: اگر آدرس سایت شما قرار است چیزی مثل username.github.io/storyshop باشد،
  // باید خط زیر را اضافه کنید (به جای storyshop اسم ریپازیتوری خودتان را بنویسید).
  // اگر از دامنه اختصاصی استفاده می‌کنید یا اسم ریپازیتوری username.github.io است، این خط را کامنت کنید.
  basePath: '/storyshop', 
}

module.exports = nextConfig