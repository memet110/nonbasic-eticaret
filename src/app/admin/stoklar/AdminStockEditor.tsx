"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { updateDesignStock } from "./actions";

type DesignStockProps = {
  design: {
    id: string;
    title: string;
    slug: string;
    preview_image_url: string;
    stock_inventory: any;
  }
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

export function AdminStockEditor({ design }: DesignStockProps) {
  // Initialize with DB values or defaults
  const [stock, setStock] = useState<Record<string, number>>(() => {
    const inv = design.stock_inventory || {};
    return {
      S: inv.S || 0,
      M: inv.M || 0,
      L: inv.L || 0,
      XL: inv.XL || 0,
      XXL: inv.XXL || 0,
    };
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleStockChange = (size: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setStock(prev => ({
      ...prev,
      [size]: Math.max(0, numValue) // Prevent negative values
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDesignStock(design.id, design.slug, stock);
      toast.success(`${design.title} stokları güncellendi!`);
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-[200px]">
        <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
          {design.preview_image_url ? (
            <img src={design.preview_image_url} alt={design.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gray-200"></div>
          )}
        </div>
        <h3 className="font-medium text-gray-900 text-sm">{design.title}</h3>
      </div>

      <div className="flex flex-wrap gap-4 items-center flex-[2] justify-end">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-col items-center">
            <label className="text-xs font-semibold text-gray-500 mb-1">{size}</label>
            <input
              type="number"
              min="0"
              value={stock[size]}
              onChange={(e) => handleStockChange(size, e.target.value)}
              className="w-16 h-10 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
            />
          </div>
        ))}
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="ml-2 h-10 px-4 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-5"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">Kaydet</span>
        </button>
      </div>
    </div>
  );
}
