"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { RefreshCcw, X, AlertCircle } from "lucide-react";

export function OrderReturnButton({ order }: { order: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // Yalnızca 'Teslim Edildi' durumunda görünür
  if (order.status !== "Teslim Edildi") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    
    setIsSubmitting(true);
    
    const returnData = {
      reason,
      description,
      date: new Date().toISOString()
    };

    const { error } = await supabase
      .from("orders")
      .update({ 
        return_request: returnData,
        status: "İade Talebi Alındı"
      })
      .eq("id", order.id);

    setIsSubmitting(false);

    if (error) {
      alert("İade talebi oluşturulurken hata oluştu: " + error.message);
    } else {
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-1 text-xs font-medium text-gray-500 hover:text-black underline underline-offset-2 transition-colors flex items-center gap-1"
      >
        <RefreshCcw className="w-3 h-3" />
        İade Talebi Oluştur
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-editorial text-xl font-semibold text-black">
                İade Talebi
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6 space-y-4">
                <div className="bg-orange-50 text-orange-800 p-3 rounded-md text-sm flex gap-2 items-start">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <p>
                    Siparişinizdeki ürünleri teslim aldıktan sonraki <strong>14 gün</strong> içerisinde iade edebilirsiniz. İade kargo kodunuz talep onaylandıktan sonra size iletilecektir.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İade Nedeni *
                  </label>
                  <select
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="" disabled>Seçiniz...</option>
                    <option value="Beden uymadı (Küçük)">Beden uymadı (Küçük geldi)</option>
                    <option value="Beden uymadı (Büyük)">Beden uymadı (Büyük geldi)</option>
                    <option value="Beklentimi karşılamadı">Beklentimi karşılamadı</option>
                    <option value="Kusurlu/Defolu ürün">Kusurlu / Defolu ürün</option>
                    <option value="Yanlış ürün gönderildi">Yanlış ürün gönderildi</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="İade talebinizle ilgili eklemek istediklerinizi yazabilirsiniz..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                  ></textarea>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !reason}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-black text-white text-sm font-medium uppercase tracking-wider rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  <RefreshCcw className="w-4 h-4" />
                  {isSubmitting ? "Oluşturuluyor..." : "Talebi Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
