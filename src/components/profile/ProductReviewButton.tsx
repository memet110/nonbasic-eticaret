"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function ProductReviewButton({ item, orderStatus, userName, hasReviewedInitially = false }: { item: any, orderStatus: string, userName: string, hasReviewedInitially?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(hasReviewedInitially); // Local state to hide button
  
  const supabase = createClient();
  const router = useRouter();

  // Yalnızca sipariş teslim edildiyse değerlendirme yapılabilir
  if (orderStatus !== "Teslim Edildi") return null;

  // Daha önce bu ekranda değerlendirme yapıldıysa butonu gizle
  if (hasReviewed) {
    return (
      <div className="mt-3 text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded w-max flex items-center gap-1 border border-green-200">
        <Star className="w-3 h-3 fill-green-700" />
        Değerlendirildi
      </div>
    );
  }

  const handleOpen = () => {
    setIsSuccess(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    
    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();

    let targetSlug = item.product_slug;
    
    // Eski siparişlerde product_slug kayıtlı olmadığı için veritabanından adıyla bulmaya çalışalım
    if (!targetSlug) {
      const { data: designData } = await supabase
        .from("designs")
        .select("slug")
        .eq("title", item.product_name)
        .single();
        
      if (designData) {
        targetSlug = designData.slug;
      }
    }

    if (!targetSlug) {
      alert("Bu ürünün bağlantısı bulunamadı (Eski sipariş veya silinmiş ürün).");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("product_reviews")
      .insert({
        product_slug: targetSlug,
        user_id: user?.id,
        user_name: userName,
        rating,
        comment,
      });

    setIsSubmitting(false);

    if (error) {
      alert("Değerlendirme gönderilirken hata oluştu: " + error.message);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setHasReviewed(true);
        router.refresh();
      }, 2000);
    }
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="mt-3 w-max text-xs font-semibold px-3 py-1.5 border border-black text-black rounded hover:bg-black hover:text-white transition-colors flex items-center gap-1"
      >
        <Star className="w-3 h-3" />
        Ürünü Değerlendir
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 relative">
            
            {/* Close Button */}
            {!isSuccess && (
              <button 
                onClick={() => setIsOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-black z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {isSuccess ? (
              <div className="px-6 py-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-green-500 fill-green-500" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-black mb-2">Teşekkürler!</h3>
                <p className="text-gray-500 text-sm">Değerlendirmeniz başarıyla kaydedildi.</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="font-editorial text-xl font-bold text-black">
                    Ürünü Değerlendir
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">{item.product_name}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  
                  {/* Rating Stars */}
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-gray-700">Puanınız</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star 
                            className={`w-8 h-8 transition-colors ${
                              (hoveredRating || rating) >= star 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-gray-200 fill-gray-200"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yorumunuz (Opsiyonel)
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ürün hakkındaki düşünceleriniz nelerdir?"
                      className="w-full border border-gray-300 rounded-md p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white text-sm font-medium py-3 rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
