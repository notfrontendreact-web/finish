import React, { useState } from 'react';
import { X, Bot, Send, Sparkles, User, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { formatToman, formatUsd } from '../utils/formatters';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  currency: 'toman' | 'usd';
  onSelectProduct: (p: Product) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  recommendedProducts?: Product[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  currency,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'سلام! من دستیار هوشمند خریدم. چه محصولی مد نظرتونه یا چقدر بودجه دارید تا بهترین گزینه رو براتون پیدا کنم؟ ✨',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    'یک هدفون خوب تا ۲۰ میلیون تومن چی داری؟',
    'بهترین ساعت مچی لوکس برای هدیه مردانه',
    'یک اسپیکر ضدآب خوب برام پیدا کن',
    'ارزان‌ترین محصولات تخفیف‌دار فروشگاه',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = textToSend || inputPrompt;
    if (!promptText.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      const data = await response.json();

      let recProds: Product[] = [];
      if (data.recommendedProductIds && Array.isArray(data.recommendedProductIds)) {
        recProds = allProducts.filter((p) => data.recommendedProductIds.includes(p.id));
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'متاسفانه پاسخی دریافت نشد، لطفاً مجددا سوال بپرسید.',
        recommendedProducts: recProds,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'در حال حاضر ارتباط با دستیار هوشمند برقرار نشد، اما می‌توانید از منوی بالای سایت محصولات را مشاهده کنید.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-2xl h-[85vh] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col relative animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black flex items-center gap-1.5">
                <span>دستیار هوشمند خرید</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h2>
              <p className="text-[10px] text-amber-200/80">پاسخ‌دهی آنی با مدل هوش مصنوعی Gemini 2.5</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-900 text-amber-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-3">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-stone-950 font-semibold rounded-tr-none'
                      : 'bg-white border border-stone-200/80 text-stone-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Recommended products cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-amber-800 block">
                      پیشنهادات ویژه دستیار هوشمند:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.recommendedProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectProduct(p);
                            onClose();
                          }}
                          className="p-2.5 bg-white border border-amber-300 hover:border-amber-500 rounded-xl flex items-center gap-2.5 cursor-pointer shadow-xs hover:shadow-md transition-all group"
                        >
                          <img
                            src={p.image}
                            alt={p.titleFa}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800">
                              {p.titleFa}
                            </h4>
                            <span className="text-[11px] font-black text-amber-700 block">
                              {currency === 'toman' ? formatToman(p.priceToman) : formatUsd(p.priceUsd)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-stone-500 text-xs italic bg-white p-3 rounded-xl border border-stone-200 max-w-xs">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>دستیار هوشمند در حال تحلیل و یافتن بهترین کالاهاست...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts & Input Bar */}
        <div className="p-4 bg-white border-t border-stone-200 space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {suggestedPrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="px-3 py-1 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 border border-stone-200 rounded-full text-stone-700 whitespace-nowrap transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="مثلا: یک هدیه لوکس تا ۴۰ میلیون تومن پیشنهاد بده..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="px-5 py-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">ارسال</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
