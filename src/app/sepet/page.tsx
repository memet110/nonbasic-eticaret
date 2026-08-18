"use client";

import Link from "next/link";
import { Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Hydration mismatch prevention

  const total = getTotal();

  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-12 lg:px-24 py-16">
      <h1 className="font-editorial text-4xl font-bold tracking-tight text-black mb-12">
        Sepetim
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6">Sepetinizde ürün bulunmamaktadır.</p>
          <Link href="/kategori/giyim" className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 uppercase text-sm font-medium tracking-wider hover:bg-gray-900 transition-colors">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {items.map((item) => (
                <li key={item.id} className="flex py-6">
                  <div className="h-32 w-24 flex-shrink-0 overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-6 flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium text-black">
                      <h3 className="capitalize">{item.name}</h3>
                      <p className="ml-4">₺{item.price * item.quantity},00</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.productType} • {item.size}
                    </p>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <label htmlFor={`qty-${item.id}`} className="sr-only">Adet</label>
                        <select 
                          id={`qty-${item.id}`} 
                          className="border border-gray-300 p-1 bg-white outline-none"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeItem(item.id)}
                        className="font-medium text-gray-500 hover:text-black"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-stone-50 p-6 sm:p-8 border border-gray-100">
              <h2 className="text-lg font-medium text-black mb-6">Sipariş Özeti</h2>
              <div className="flex justify-between text-sm mb-4">
                <p className="text-gray-600">Ara Toplam</p>
                <p className="font-medium text-black">₺{total},00</p>
              </div>
              <div className="flex justify-between text-sm mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-600">Kargo</p>
                <p className="font-medium text-black">₺0,00</p>
              </div>
              <div className="flex justify-between text-base font-bold text-black mb-8">
                <p>Toplam</p>
                <p>₺{total},00</p>
              </div>
              <Link 
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 bg-black py-4 px-4 text-white font-medium hover:bg-gray-900 transition-colors uppercase text-sm tracking-wider"
              >
                Ödemeye Geç
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
