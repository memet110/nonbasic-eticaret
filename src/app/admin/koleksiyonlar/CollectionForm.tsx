"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCollectionCover, createCollection, deleteCollection, createProductType, deleteProductType } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { Loader2, UploadCloud, Image as ImageIcon, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

type Collection = { id: string; name: string; slug: string; cover_image_url?: string; };
type ProductType = { id: string; name: string; slug: string; };

export function CollectionForm({ 
  initialCollections, 
  initialProductTypes 
}: { 
  initialCollections: Collection[], 
  initialProductTypes: ProductType[] 
}) {
  const router = useRouter();
  const supabase = createClient();
  const [collections, setCollections] = useState(initialCollections);
  const [productTypes, setProductTypes] = useState(initialProductTypes);

  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  useEffect(() => {
    setProductTypes(initialProductTypes);
  }, [initialProductTypes]);
  
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [newColName, setNewColName] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [creatingCol, setCreatingCol] = useState(false);
  const [creatingType, setCreatingType] = useState(false);

  // --- Collection Actions ---
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>, colId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingId(colId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `collections/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw new Error("Görsel yüklenemedi: " + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      const result = await updateCollectionCover(colId, publicUrl);
      if (result.error) throw new Error(result.error);

      setCollections(prev => prev.map(c => c.id === colId ? { ...c, cover_image_url: publicUrl } : c));
      toast.success("Kapak görseli güncellendi!");
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreateCollection = async () => {
    if (!newColName.trim()) return;
    setCreatingCol(true);
    try {
      const res = await createCollection(newColName);
      if (res.error) throw new Error(res.error);
      if (res.collection) {
        setCollections([res.collection, ...collections]);
        setNewColName("");
        toast.success("Koleksiyon eklendi");
        router.refresh();
      }
    } catch(err: any) {
      toast.error(err.message || "Koleksiyon eklenemedi");
    } finally {
      setCreatingCol(false);
    }
  };

  const handleDeleteCollection = async (id: string, name: string) => {
    if (!confirm(`"${name}" koleksiyonunu silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await deleteCollection(id);
      if (res.error) throw new Error(res.error);
      setCollections(prev => prev.filter(c => c.id !== id));
      toast.success("Koleksiyon silindi");
    } catch(err: any) {
      toast.error(err.message || "Silinemedi");
    }
  };

  // --- Product Type Actions ---
  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;
    setCreatingType(true);
    try {
      const res = await createProductType(newTypeName);
      if (res.error) throw new Error(res.error);
      if (res.productType) {
        setProductTypes([res.productType, ...productTypes]);
        setNewTypeName("");
        toast.success("Ürün Tipi eklendi");
      }
    } catch(err: any) {
      toast.error(err.message || "Eklenemedi");
    } finally {
      setCreatingType(false);
    }
  };

  const handleDeleteType = async (id: string, name: string) => {
    if (!confirm(`"${name}" ürün tipini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await deleteProductType(id);
      if (res.error) throw new Error(res.error);
      setProductTypes(prev => prev.filter(c => c.id !== id));
      toast.success("Ürün Tipi silindi");
    } catch(err: any) {
      toast.error(err.message || "Silinemedi");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* SOL: Koleksiyonlar */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Yeni Koleksiyon Oluştur</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Koleksiyon Adı (Örn: Fall 2024)"
              value={newColName}
              onChange={e => setNewColName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black outline-none"
            />
            <button 
              onClick={handleCreateCollection}
              disabled={creatingCol || !newColName}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {creatingCol ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ekle"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Mevcut Koleksiyonlar</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {collections.map(col => (
              <div key={col.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                
                {/* Thumbnail */}
                <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0 group">
                  {col.cover_image_url ? (
                    <img src={col.cover_image_url} alt={col.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6 opacity-50" />
                    </div>
                  )}
                  
                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer text-white p-1 hover:scale-110 transition-transform">
                      {loadingId === col.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                      <input 
                        type="file" accept="image/*" className="hidden" 
                        disabled={loadingId === col.id}
                        onChange={(e) => handleUploadCover(e, col.id)}
                      />
                    </label>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{col.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">/{col.slug}</p>
                </div>

                {/* Actions */}
                <button 
                  onClick={() => handleDeleteCollection(col.id, col.name)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {collections.length === 0 && (
              <div className="p-8 text-center text-gray-500">Koleksiyon bulunamadı.</div>
            )}
          </div>
        </div>
      </div>

      {/* SAĞ: Ürün Tipleri */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Yeni Ürün Tipi Oluştur</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Ürün Tipi (Örn: T-Shirt, Kupa)"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black outline-none"
            />
            <button 
              onClick={handleCreateType}
              disabled={creatingType || !newTypeName}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {creatingType ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ekle"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Mevcut Ürün Tipleri</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {productTypes.map(type => (
              <div key={type.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900">{type.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">/{type.slug}</p>
                </div>
                <button 
                  onClick={() => handleDeleteType(type.id, type.name)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {productTypes.length === 0 && (
              <div className="p-8 text-center text-gray-500">Ürün Tipi bulunamadı.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
