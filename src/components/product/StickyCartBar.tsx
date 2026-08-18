"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

type StickyCartProps = {
  slug: string;
  name: string;
  price: number;
  image: string;
  stockInventory?: Record<string, number>;
};

export function StickyCartBar({ slug, name, price, image, stockInventory }: StickyCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [size, setSize] = useState<string>("L");
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAdd = () => {
    addItem({
      slug,
      name,
      price,
      quantity: 1,
      size, 
      productType: "Tişört", 
      image,
    });
    openDrawer();
    toast.success(`${name} (${size}) sepetinize eklendi.`);
  };

  const isOutOfStock = stockInventory && stockInventory[size] === 0;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transform transition-transform duration-300 ease-in-out z-50 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={image} alt={name} className="h-12 w-10 object-cover" />
          <div className="hidden sm:block">
            <h4 className="text-sm font-bold">{name}</h4>
            <p className="text-sm text-gray-500">₺{price},00</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="border border-gray-300 bg-white px-2 py-2 text-sm focus:outline-none"
          >
            {["S", "M", "L", "XL", "XXL"].map(s => {
              const outOfStock = stockInventory && stockInventory[s] === 0;
              return (
                <option key={s} value={s} disabled={outOfStock}>
                  {s} {outOfStock ? "(Tükendi)" : ""}
                </option>
              );
            })}
          </select>
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              isOutOfStock 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{isOutOfStock ? "Tükendi" : "Sepete Ekle"}</span>
            <span className="sm:hidden">{isOutOfStock ? "Yok" : "Ekle"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
