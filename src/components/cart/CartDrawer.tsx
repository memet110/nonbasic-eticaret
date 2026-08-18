"use client";

import { useCartStore } from "@/store/cartStore";
import { X, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 1000;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progressPercentage = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-editorial text-2xl font-bold">Sepetim ({items.length})</h2>
          <button onClick={closeDrawer} className="text-gray-400 hover:text-black transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {items.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <p className="text-sm text-center mb-2 font-medium">
              {amountToFreeShipping > 0 
                ? <>Kargo bedavaya son <span className="text-black font-bold">₺{amountToFreeShipping.toLocaleString('tr-TR')}</span> kaldı!</>
                : <span className="text-green-600 font-bold">Tebrikler! Kargo Bedava 🚀</span>
              }
            </p>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${amountToFreeShipping === 0 ? 'bg-green-500' : 'bg-black'}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 gap-4">
              <p>Sepetiniz şu an boş.</p>
              <button onClick={closeDrawer} className="text-black font-medium border-b border-black pb-1">
                Alışverişe Devam Et
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="h-24 w-20 bg-gray-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-bold text-sm text-black">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.productType} • {item.size}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 text-gray-500 hover:text-black"
                      >-</button>
                      <span className="px-2 text-sm text-black font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-gray-500 hover:text-black"
                      >+</button>
                    </div>
                    <span className="text-sm font-bold text-black">₺{(item.price * item.quantity).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0 self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Ara Toplam</span>
              <span className="text-lg font-bold text-black">₺{total.toLocaleString('tr-TR')}</span>
            </div>
            <p className="text-xs text-gray-500 mb-6 text-center">Kargo ve vergiler ödeme adımında hesaplanır.</p>
            <button 
              onClick={handleCheckout}
              className="w-full bg-black text-white py-4 flex items-center justify-center gap-2 font-medium tracking-wider text-sm uppercase hover:bg-gray-900 transition-colors"
            >
              Ödemeye Geç
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
