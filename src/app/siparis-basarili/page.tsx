"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Sepeti temizle
    clearCart();
  }, [clearCart]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
      <h1 className="font-editorial text-4xl font-bold tracking-tight text-black mb-4">
        Siparişiniz Alındı!
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
        Teşekkür ederiz. Ödemeniz başarıyla gerçekleşti ve siparişiniz onaylandı. 
        Sipariş detaylarınızı hesabım sayfasından takip edebilirsiniz.
      </p>
      <div className="flex gap-4 justify-center">
        <Link 
          href="/hesabim" 
          className="bg-black text-white px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-gray-900 transition-colors"
        >
          Siparişlerimi Gör
        </Link>
        <Link 
          href="/" 
          className="border border-gray-300 text-black px-8 py-4 text-sm font-medium uppercase tracking-wider hover:bg-gray-50 transition-colors"
        >
          Alışverişe Dön
        </Link>
      </div>
    </div>
  );
}
