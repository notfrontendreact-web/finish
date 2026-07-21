// Convert English numbers to Persian numbers
export function toPersianDigits(num: number | string): string {
  if (num === null || num === undefined) return '';
  const latin = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return latin.replace(/[0-9]/g, (w) => persianDigits[parseInt(w)]);
}

// Format number with commas (e.g. 18,500,000) in Persian
export function formatToman(amount: number): string {
  if (isNaN(amount)) return '۰ تومان';
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '٫');
  return `${toPersianDigits(formatted)} تومان`;
}

// Format USD
export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}
