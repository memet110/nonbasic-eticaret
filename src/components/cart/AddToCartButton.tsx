"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag, X, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

type AddToCartProps = {
  slug: string;
  name: string;
  price: number;
  image: string;
  stockInventory?: Record<string, number>;
};

export function AddToCartButton({ slug, name, price, image, stockInventory }: AddToCartProps) {
  const [size, setSize] = useState<string>("L");
  const [productType, setProductType] = useState<string>("Tişört");
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const [added, setAdded] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const handleAdd = () => {
    addItem({
      slug,
      name,
      price,
      quantity: 1,
      size,
      productType,
      image,
    });
    setAdded(true);
    openDrawer();
    toast.success(`${name} (${size}) sepetinize eklendi.`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <div className="mt-8 border-t border-gray-200 pt-8">
        <h3 className="text-sm font-medium text-gray-900">Ürün Tipi Seçin</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {["Tişört", "Sweatshirt", "Mug"].map((type) => (
            <button
              key={type}
              onClick={() => setProductType(type)}
              className={`border-2 px-6 py-3 text-sm font-medium transition-colors ${
                productType === type
                  ? "border-black bg-white text-black"
                  : "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Beden</h3>
          <button 
            onClick={() => setIsSizeGuideOpen(true)}
            className="text-sm text-gray-500 underline hover:text-black"
          >
            Beden Tablosu
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {["S", "M", "L", "XL", "XXL"].map((s) => {
            const isMug = productType === "Mug";
            // Check stock only if inventory exists and it's not a Mug (mugs don't have sizes)
            const isOutOfStock = !isMug && stockInventory && stockInventory[s] === 0;
            const isDisabled = isMug || isOutOfStock;

            return (
              <button
                key={s}
                onClick={() => setSize(s)}
                disabled={isDisabled}
                className={`flex h-12 w-12 items-center justify-center border text-sm font-medium transition-colors ${
                  isMug
                    ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400"
                    : isOutOfStock
                    ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400 relative overflow-hidden"
                    : size === s
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-black"
                }`}
                title={isOutOfStock ? "Tükendi" : ""}
              >
                {s}
                {isOutOfStock && (
                  <span className="absolute inset-0 w-full h-full flex items-center justify-center -rotate-45">
                    <span className="w-[150%] h-px bg-gray-300"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleAdd}
        className={`mt-10 flex w-full items-center justify-center gap-2 py-4 font-medium transition-all ${
          added
            ? "bg-green-600 text-white"
            : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        <ShoppingBag className="h-5 w-5" />
        {added ? "Sepete Eklendi!" : "Sepete Ekle"}
      </button>

      {/* Trust Badges */}
      <div className="mt-8 grid grid-cols-3 gap-2 border-t border-gray-200 pt-6">
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <Truck className="h-5 w-5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium tracking-wide">Hızlı Kargo</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium tracking-wide">Güvenli Ödeme</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <RefreshCw className="h-5 w-5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium tracking-wide">Kolay İade</span>
        </div>
      </div>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)} />
          <div className="relative bg-white w-full max-w-lg shadow-2xl p-8">
            <button 
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-editorial text-2xl font-bold mb-6">Beden Ölçüleri (cm)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 font-medium text-gray-500">Beden</th>
                    <th className="py-3 font-medium text-gray-500">Göğüs (En)</th>
                    <th className="py-3 font-medium text-gray-500">Uzunluk (Boy)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-medium">S</td>
                    <td className="py-3 text-gray-600">50</td>
                    <td className="py-3 text-gray-600">68</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-medium">M</td>
                    <td className="py-3 text-gray-600">52</td>
                    <td className="py-3 text-gray-600">70</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-medium">L</td>
                    <td className="py-3 text-gray-600">54</td>
                    <td className="py-3 text-gray-600">72</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-medium">XL</td>
                    <td className="py-3 text-gray-600">56</td>
                    <td className="py-3 text-gray-600">74</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">XXL</td>
                    <td className="py-3 text-gray-600">58</td>
                    <td className="py-3 text-gray-600">76</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-6">* Ölçülerde ±2 cm tölerans payı olabilir.</p>
          </div>
        </div>
      )}
    </div>
  );
}
