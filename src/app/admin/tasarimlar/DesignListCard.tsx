"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Tag, Check, X, Loader2 } from "lucide-react";
import { updateDesignPrice, deleteDesign } from "./actions";
import toast from "react-hot-toast";

export function DesignListCard({ design }: { design: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [price, setPrice] = useState(design.price || 450);
  const [savingPrice, setSavingPrice] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${design.title}" tasarımını silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.`)) return;
    
    setIsDeleting(true);
    try {
      const res = await deleteDesign(design.id);
      if (res.error) throw new Error(res.error);
      toast.success("Tasarım silindi.");
    } catch(err: any) {
      toast.error(err.message || "Silinemedi");
      setIsDeleting(false);
    }
  };

  const handleSavePrice = async () => {
    setSavingPrice(true);
    try {
      const res = await updateDesignPrice(design.id, Number(price));
      if (res.error) throw new Error(res.error);
      toast.success("Fiyat güncellendi.");
      setIsEditingPrice(false);
    } catch(err: any) {
      toast.error(err.message || "Fiyat güncellenemedi");
    } finally {
      setSavingPrice(false);
    }
  };

  if (isDeleting) return null; // Hide optimistically

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group flex flex-col shadow-sm hover:shadow-md transition-all">
      <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
        <img 
          src={design.preview_image_url} 
          alt={design.title}
          style={{ objectPosition: design.main_image_position ? `${design.main_image_position.x}% ${design.main_image_position.y}%` : '50% 50%' }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm">
          ₺{design.price || 450}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{design.collections?.name || "Koleksiyonsuz"}</p>
        <h3 className="text-sm font-bold text-gray-900 truncate mb-4">{design.title}</h3>
        
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex gap-2">
            <Link 
              href={`/admin/tasarimlar/${design.slug || design.id}/duzenle`}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Düzenle"
            >
              <Edit className="w-4 h-4" />
            </Link>
            
            <div className="relative">
              <button 
                onClick={() => setIsEditingPrice(!isEditingPrice)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Hızlı Fiyat Değiştir"
              >
                <Tag className="w-4 h-4" />
              </button>

              {isEditingPrice && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 p-2 rounded-lg shadow-xl z-10 flex gap-2 w-48">
                  <input 
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded outline-none focus:border-black"
                  />
                  <button 
                    onClick={handleSavePrice}
                    disabled={savingPrice}
                    className="p-1.5 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    {savingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setIsEditingPrice(false)}
                    className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleDelete}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
