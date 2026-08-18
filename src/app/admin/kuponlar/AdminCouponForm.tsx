"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function AdminCouponForm() {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [minCartAmount, setMinCartAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const couponCode = code.trim().toUpperCase();
    
    if (!couponCode || !value) {
      setError("Kod ve indirim değeri zorunludur.");
      setIsSubmitting(false);
      return;
    }

    const { error: dbError } = await supabase
      .from("coupons")
      .insert({
        code: couponCode,
        discount_type: type,
        discount_value: parseFloat(value),
        max_usage: maxUsage ? parseInt(maxUsage) : null,
        min_cart_amount: minCartAmount ? parseFloat(minCartAmount) : 0,
        is_active: true
      });

    setIsSubmitting(false);

    if (dbError) {
      setError(dbError.message.includes("unique") 
        ? "Bu kupon kodu zaten mevcut!" 
        : "Kupon eklenirken hata oluştu.");
    } else {
      // Reset form
      setCode("");
      setValue("");
      setMaxUsage("");
      setMinCartAmount("");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Kupon Kodu</label>
        <input 
          type="text" 
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Örn: YAZ10, HOSGELDIN"
          className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-black uppercase" 
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">İndirim Tipi</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-black bg-white"
          >
            <option value="percentage">Yüzde (%)</option>
            <option value="fixed">Sabit Tutar (₺)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Değer</label>
          <input 
            type="number" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === 'percentage' ? "Örn: 10" : "Örn: 50"}
            min="1"
            className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-black" 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Sepet Tutarı (Opsiyonel)</label>
        <input 
          type="number" 
          value={minCartAmount}
          onChange={(e) => setMinCartAmount(e.target.value)}
          placeholder="0"
          min="0"
          className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-black" 
        />
        <p className="text-[10px] text-gray-500 mt-1">Kuponun uygulanabilmesi için gereken min. sepet tutarı.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Kullanım Limiti (Opsiyonel)</label>
        <input 
          type="number" 
          value={maxUsage}
          onChange={(e) => setMaxUsage(e.target.value)}
          placeholder="Sınırsız"
          min="1"
          className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-black" 
        />
        <p className="text-[10px] text-gray-500 mt-1">Bu kupon toplam kaç kişi tarafından kullanılabilir?</p>
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white text-sm font-medium py-2.5 rounded hover:bg-gray-900 transition-colors disabled:opacity-50 mt-2"
      >
        {isSubmitting ? "Ekleniyor..." : "Kuponu Oluştur"}
      </button>
    </form>
  );
}
