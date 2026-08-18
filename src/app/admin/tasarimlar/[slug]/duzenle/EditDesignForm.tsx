"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateDesign } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { Loader2, UploadCloud, Plus, X, GripHorizontal, Move } from "lucide-react";
import toast from "react-hot-toast";

type Collection = { id: string; name: string; };
type ProductType = { id: string; name: string; };

type ImageData = {
  url: string;
  file: File | null;
  isMain: boolean;
};

export function EditDesignForm({ 
  design,
  collections, 
  productTypes 
}: { 
  design: any,
  collections: Collection[],
  productTypes: ProductType[]
}) {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(design.title || "");
  const [slug, setSlug] = useState(design.slug || "");
  const [price, setPrice] = useState(design.price?.toString() || "450");
  const [description, setDescription] = useState(design.description || "");
  
  const [productType, setProductType] = useState(design.product_type || productTypes[0]?.name || "T-Shirt");
  const [selectedCollection, setSelectedCollection] = useState(design.collection_id || "");

  // Initial images state
  const initialImages: ImageData[] = [];
  if (design.preview_image_url) {
    initialImages.push({ url: design.preview_image_url, file: null, isMain: true });
  }
  if (design.gallery_images && Array.isArray(design.gallery_images)) {
    design.gallery_images.forEach((url: string) => {
      initialImages.push({ url, file: null, isMain: false });
    });
  }
  const [images, setImages] = useState<ImageData[]>(initialImages);

  // Drag to reorder state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Drag to pan image state
  const [imagePos, setImagePos] = useState(design.main_image_position || { x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, initialX: 50, initialY: 50 });

  const mainImage = images.find(img => img.isMain) || images[0];
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const currentPreview = activePreview || mainImage?.url || "";

  const autoGenerateSlug = (text: string) => {
    return text.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!slug || slug === autoGenerateSlug(title)) {
      setSlug(autoGenerateSlug(e.target.value));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      toast.error("En fazla 10 görsel ekleyebilirsiniz.");
      return;
    }
    
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file,
      isMain: false
    }));

    setImages(prev => {
      const combined = [...prev, ...newImages];
      if (combined.length > 0 && !combined.find(i => i.isMain)) {
        combined[0].isMain = true;
      }
      return combined;
    });
    
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newArr = [...prev];
      const removed = newArr.splice(index, 1)[0];
      if (removed.isMain && newArr.length > 0) {
        newArr[0].isMain = true;
      }
      if (activePreview === removed.url) {
        setActivePreview(null);
      }
      return newArr;
    });
  };

  const setAsMain = (index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isMain: i === index
    })));
  };

  // --- Drag and Drop Reordering ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    if(e.currentTarget instanceof HTMLElement) {
       e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if(e.currentTarget instanceof HTMLElement) {
       e.currentTarget.style.opacity = '1';
    }
    setDraggedIdx(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    setImages(prev => {
      const newArr = [...prev];
      const draggedItem = newArr[draggedIdx];
      newArr.splice(draggedIdx, 1);
      newArr.splice(index, 0, draggedItem);
      setDraggedIdx(index);
      return newArr;
    });
  };

  // --- Pan Image ---
  const handlePanStart = (e: React.MouseEvent) => {
    setIsPanning(true);
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: imagePos.x,
      initialY: imagePos.y
    };
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = (e.clientX - panStart.current.x) * -0.2;
    const dy = (e.clientY - panStart.current.y) * -0.2;
    setImagePos({
      x: Math.max(0, Math.min(100, panStart.current.initialX + dx)),
      y: Math.max(0, Math.min(100, panStart.current.initialY + dy))
    });
  };

  const handlePanEnd = () => setIsPanning(false);

  // --- API ---
  const uploadFileToSupabase = async (fileToUpload: File) => {
    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, fileToUpload);

    if (uploadError) {
      throw new Error(`Görsel yüklenemedi: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Lütfen en az bir görsel yükleyin!");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const finalImageUrls: string[] = [];
      let finalMainUrl = "";

      for (const img of images) {
        let finalUrl = img.url;
        if (img.file) {
          finalUrl = await uploadFileToSupabase(img.file);
        }
        finalImageUrls.push(finalUrl);
        if (img.isMain) finalMainUrl = finalUrl;
      }
      
      const galleryUrls = finalImageUrls.filter(url => url !== finalMainUrl);

      formData.set("preview_image_url", finalMainUrl);
      formData.set("gallery_images", JSON.stringify(galleryUrls));
      formData.set("main_image_position", JSON.stringify(imagePos));

      const result = await updateDesign(design.id, formData);
      if (result.error) throw new Error(result.error);

      toast.success("Ürün başarıyla güncellendi!");
      router.push("/admin/tasarimlar");
      router.refresh();

    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
      {/* SOL TARAF: Büyük Canlı Önizleme */}
      <div className="sticky top-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex justify-between items-center">
          <span>Canlı Önizleme</span>
          {currentPreview && <span className="text-xs text-gray-400 font-normal flex items-center gap-1"><Move className="w-3 h-3"/> Kaydırmak için sürükle</span>}
        </h3>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md group p-6 select-none">
          
          {/* Ana Resim */}
          <div 
            className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden relative flex items-center justify-center mb-6 cursor-move"
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
          >
            {currentPreview ? (
              <img 
                src={currentPreview} 
                alt={title || "Önizleme"}
                style={{ objectPosition: `${imagePos.x}% ${imagePos.y}%` }}
                className="w-full h-full object-cover transition-transform duration-700 pointer-events-none"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <UploadCloud className="w-12 h-12 mb-3 opacity-30" />
                <span className="text-sm font-medium">Görsel Seçilmedi</span>
              </div>
            )}
            
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-gray-100">
              {productType}
            </div>
          </div>
          
          {/* Küçük Resimler (Galeri) */}
          {images.length > 1 && (
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide justify-center">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setActivePreview(img.url)}
                  onMouseLeave={() => setActivePreview(null)}
                  className={`w-16 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                    currentPreview === img.url ? "border-black" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} className="w-full h-full object-cover pointer-events-none" />
                </button>
              ))}
            </div>
          )}

          {/* Ürün Bilgileri */}
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">
              {collections.find(c => c.id === selectedCollection)?.name || "Koleksiyon Adı"}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 truncate mb-3">
              {title || "Yeni Ürün Başlığı"}
            </h3>
            <p className="text-lg text-gray-900 font-semibold mb-6">₺{price || "450"},00</p>
            
            <button type="button" disabled className="w-full bg-black text-white py-4 rounded-full font-bold text-sm opacity-50 cursor-not-allowed">
              SEPETE EKLE
            </button>
          </div>
        </div>
      </div>

      {/* SAĞ TARAF: Form */}
      <div>
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-2 rounded-xl">
          {/* Genel Bilgiler */}
          <div className="space-y-5">
            <h4 className="text-lg font-bold border-b pb-2">Temel Bilgiler</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı (Başlık) *</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  value={title || ""}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none"
                  placeholder="Örn: Minimalist Dağ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bağlantı URL (Slug) *</label>
                <input 
                  type="text" 
                  name="slug" 
                  required
                  value={slug || ""}
                  onChange={(e) => setSlug(autoGenerateSlug(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL) *</label>
                <input 
                  type="number" 
                  name="price" 
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Tipi *</label>
                <select 
                  name="product_type" 
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none bg-white text-sm"
                >
                  {productTypes.map(pt => (
                    <option key={pt.id} value={pt.name}>{pt.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Koleksiyon</label>
                <select 
                  name="collection_id" 
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none bg-white text-sm"
                >
                  <option value="">-- Seçiniz --</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Açıklaması</label>
              <textarea 
                name="description" 
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none"
                placeholder="Detaylı bilgi verin..."
              ></textarea>
            </div>
          </div>

          {/* Görsel Galerisi */}
          <div className="space-y-5 pt-4">
            <h4 className="text-lg font-bold border-b pb-2 flex items-center justify-between">
              Görsel Galerisi 
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">{images.length}/10 Görsel</span>
            </h4>
            
            <div>
              <input 
                type="file" 
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-12 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg focus:ring-black focus:border-black outline-none text-sm cursor-pointer hover:bg-gray-100 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-900"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Sürükle bırak ile sıralamayı değiştirebilirsiniz.
              </p>
            </div>

            {/* Eklenen Görsellerin Listesi (Sürüklenebilir) */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {images.map((img, index) => (
                  <div 
                    key={img.url} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    className={`relative rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing bg-white ${img.isMain ? 'border-black' : 'border-gray-200'}`}
                  >
                    <img src={img.url} className="w-full h-24 object-cover pointer-events-none" />
                    
                    {/* Silme Butonu */}
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-50 text-red-500 z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    {/* Sürükleme İkonu */}
                    <div className="absolute top-1 left-1 bg-white/80 p-1 rounded shadow text-gray-500 pointer-events-none">
                       <GripHorizontal className="w-3 h-3" />
                    </div>

                    {!img.isMain && (
                      <button 
                        type="button" 
                        onClick={() => setAsMain(index)}
                        className="absolute bottom-1 left-1 bg-white/90 text-xs px-2 py-0.5 rounded font-medium shadow z-10"
                      >
                        Ana Görsel Yap
                      </button>
                    )}
                    {img.isMain && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-1 font-bold pointer-events-none">
                        ANA GÖRSEL
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stok Bilgileri */}
          <div className="space-y-5 pt-4">
            <h4 className="text-lg font-bold border-b pb-2">Başlangıç Stokları</h4>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {["S", "M", "L", "XL", "XXL"].map(size => (
                <div key={size} className="flex flex-col flex-1 min-w-[60px]">
                  <label className="text-xs text-gray-500 mb-1 text-center font-bold">{size}</label>
                  <input 
                    type="number" 
                    name={`stock_${size}`} 
                    defaultValue={design.stock_inventory?.[size] || 10} 
                    min="0"
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none text-center text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
              Ürünü Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
