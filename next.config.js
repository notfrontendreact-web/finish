   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export', // تبدیل به سایت استاتیک
     images: {
       unoptimized: true, // غیرفعال کردن بهینه‌سازی تصاویر
     },
     basePath: '/storyshop', // نام ریپازیتوری گیت‌هاب شما
   };

   module.exports = nextConfig;