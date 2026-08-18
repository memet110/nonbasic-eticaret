"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Filter, ChevronDown, Check } from "lucide-react";
import { DesignCard } from "@/components/product/DesignCard";

export function CategoryClient({ title, desc, initialDesigns }: { title: string, desc: string, initialDesigns: any[] }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("varsayilan");
  const [selectedCollection, setSelectedCollection] = useState<string>("Tümü");
  const [selectedType, setSelectedType] = useState<string>("Tümü");
  const [selectedSize, setSelectedSize] = useState<string>("Tümü");
  const [selectedPrice, setSelectedPrice] = useState<string>("Tümü");

  // Get unique collections and types
  const collections = ["Tümü", ...Array.from(new Set(initialDesigns.map(d => d.collections?.name).filter(Boolean)))];
  const productTypes = ["Tümü", ...Array.from(new Set(initialDesigns.map(d => d.product_type).filter(Boolean)))];

  const filteredDesigns = useMemo(() => {
    let result = [...initialDesigns];

    // Filter by Collection
    if (selectedCollection !== "Tümü") {
      result = result.filter(d => d.collections?.name === selectedCollection);
    }

    // Filter by Product Type
    if (selectedType !== "Tümü") {
      result = result.filter(d => d.product_type === selectedType);
    }

    // Filter by Price
    if (selectedPrice !== "Tümü") {
      result = result.filter(d => {
        const price = d.price || 450;
        if (selectedPrice === "0-250") return price >= 0 && price <= 250;
        if (selectedPrice === "250-400") return price > 250 && price <= 400;
        if (selectedPrice === "400-800") return price > 400 && price <= 800;
        if (selectedPrice === "800+") return price > 800;
        return true;
      });
    }

    // Sort
    if (selectedSort === "a-z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === "z-a") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [initialDesigns, selectedSort, selectedCollection, selectedType, selectedSize, selectedPrice]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col items-center border-b border-gray-200 pb-12 mb-12 text-center">
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-black capitalize">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-gray-500">
          {desc}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Filters (Desktop) / Dropdown (Mobile) */}
        <div className="w-full md:w-64 flex-shrink-0">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex w-full items-center justify-between border-b border-gray-200 pb-4 text-left font-medium text-black md:hidden"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrele ve Sırala
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </button>

          <div className={`${isFilterOpen ? "block" : "hidden"} md:block pt-4 md:pt-0`}>
            {/* Sorting */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 tracking-wider text-sm uppercase">Sıralama</h3>
              <div className="space-y-3">
                {[
                  { id: "varsayilan", label: "Önerilen" },
                  { id: "a-z", label: "İsme Göre (A-Z)" },
                  { id: "z-a", label: "İsme Göre (Z-A)" }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedSort(option.id)}
                    className="flex w-full items-center justify-between text-sm text-gray-600 hover:text-black group"
                  >
                    <span className={selectedSort === option.id ? "font-bold text-black" : ""}>
                      {option.label}
                    </span>
                    {selectedSort === option.id && <Check className="h-4 w-4 text-black" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Collection Filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 tracking-wider text-sm uppercase">Koleksiyonlar</h3>
              <div className="space-y-3">
                {collections.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedCollection(col)}
                    className="flex w-full items-center justify-between text-sm text-gray-600 hover:text-black group"
                  >
                    <span className={selectedCollection === col ? "font-bold text-black" : ""}>
                      {col}
                    </span>
                    {selectedCollection === col && <Check className="h-4 w-4 text-black" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Ürün Tipi Filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 tracking-wider text-sm uppercase">Ürün Tipi</h3>
              <div className="space-y-3">
                {productTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className="flex w-full items-center justify-between text-sm text-gray-600 hover:text-black group"
                  >
                    <span className={selectedType === type ? "font-bold text-black" : ""}>
                      {type}
                    </span>
                    {selectedType === type && <Check className="h-4 w-4 text-black" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Beden Filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 tracking-wider text-sm uppercase">Beden</h3>
              <div className="space-y-3">
                {["Tümü", "XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="flex w-full items-center justify-between text-sm text-gray-600 hover:text-black group"
                  >
                    <span className={selectedSize === size ? "font-bold text-black" : ""}>
                      {size}
                    </span>
                    {selectedSize === size && <Check className="h-4 w-4 text-black" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Fiyat Filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 tracking-wider text-sm uppercase">Fiyat Aralığı</h3>
              <div className="space-y-3">
                {[
                  { id: "Tümü", label: "Tümü" },
                  { id: "0-250", label: "0 TL - 250 TL" },
                  { id: "250-400", label: "250 TL - 400 TL" },
                  { id: "400-800", label: "400 TL - 800 TL" },
                  { id: "800+", label: "800 TL ve üzeri" }
                ].map((price) => (
                  <button
                    key={price.id}
                    onClick={() => setSelectedPrice(price.id)}
                    className="flex w-full items-center justify-between text-sm text-gray-600 hover:text-black group"
                  >
                    <span className={selectedPrice === price.id ? "font-bold text-black" : ""}>
                      {price.label}
                    </span>
                    {selectedPrice === price.id && <Check className="h-4 w-4 text-black" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
            <span className="text-sm font-medium text-gray-500">
              {filteredDesigns.length} Sonuç
            </span>
            {selectedCollection !== "Tümü" && (
              <button 
                onClick={() => setSelectedCollection("Tümü")}
                className="text-xs text-gray-400 underline hover:text-black"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          {filteredDesigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDesigns.map((item) => (
                <DesignCard key={item.id} design={item} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-gray-500 bg-gray-50 border border-dashed border-gray-200">
              Seçili kriterlere uygun tasarım bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
