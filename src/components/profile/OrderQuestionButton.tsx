"use client";

import { useState, useEffect, useMemo } from "react";
import { MessageCircle, Send, X, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function OrderQuestionButton({ order }: { order: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  // Parse history from customer_question column (which now acts as a JSON store)
  const history = useMemo(() => {
    if (!order.customer_question) return [];
    try {
      const parsed = JSON.parse(order.customer_question);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Legacy text fallback
      return [{
        id: 1,
        q: order.customer_question,
        a: order.admin_reply || null,
        date: order.created_at
      }];
    }
    return [];
  }, [order.customer_question, order.admin_reply]);

  const lastItem = history.length > 0 ? history[history.length - 1] : null;
  const activeQuestion = (lastItem && !lastItem.a) ? lastItem : null;
  const answeredQuestions = activeQuestion ? history.slice(0, history.length - 1) : history;
  const hasUnanswered = !!activeQuestion;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsSubmitting(true);
    
    let newHistory;
    if (activeQuestion) {
      // Düzenleme yapılıyorsa
      newHistory = [...history];
      newHistory[newHistory.length - 1].q = question;
    } else {
      // Yeni soru ekleniyorsa
      const newEntry = {
        id: Date.now(),
        q: question,
        a: null,
        date: new Date().toISOString()
      };
      newHistory = [...history, newEntry];
    }

    const { error } = await supabase
      .from("orders")
      .update({ 
        customer_question: JSON.stringify(newHistory),
        admin_reply: null // Reset for admin panel visibility
      })
      .eq("id", order.id);

    setIsSubmitting(false);

    if (error) {
      alert("Soru gönderilirken hata oluştu: " + error.message);
    } else {
      setQuestion("");
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100">
      <div className="py-4 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">
          Siparişinizle İlgili Destek Talepleri
        </span>
        
        {(order.status !== "Teslim Edildi" && order.status !== "İptal Edildi" && !hasUnanswered) && (
          <button 
            onClick={() => setIsOpen(true)}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-black hover:bg-stone-50 transition-colors rounded-md shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            {history.length > 0 ? "Yeni Soru Sor" : "Siparişe Soru Sor"}
          </button>
        )}
      </div>

      {/* Accordion for Answered Questions */}
      {answeredQuestions.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {answeredQuestions.map((item: any) => (
            <div key={item.id} className="border border-gray-200 rounded-md overflow-hidden bg-white">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2 truncate flex-1 pr-4">
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase tracking-wider border border-green-200 flex-shrink-0">Cevaplandı</span>
                  <span className="text-sm text-gray-700 truncate max-w-[40%]">{item.q}</span>
                  <span className="text-sm text-gray-300 flex-shrink-0 mx-1">-</span>
                  <span className="text-sm text-orange-600 truncate flex-1">{item.a}</span>
                </div>
                {expandedId === item.id ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
              </button>
              
              {expandedId === item.id && (
                <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">S</div>
                      <span className="text-sm font-semibold text-black">Siz</span>
                    </div>
                    <p className="text-sm text-gray-700 pl-8 break-words">{item.q}</p>
                  </div>
                  <div className="pl-8 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">N</div>
                      <span className="text-sm font-semibold text-orange-600">NONBASIC. (Satıcı)</span>
                    </div>
                    <p className="text-sm text-gray-800 pl-8 break-words">{item.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Active Question Thread (Unanswered) */}
      {activeQuestion && (
        <div className="pb-4">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
            <div className="mb-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">S</div>
                  <span className="text-sm font-semibold text-black">Siz</span>
                </div>
                <p className="text-sm text-gray-700 pl-8">{activeQuestion.q}</p>
              </div>
              <button 
                onClick={() => {
                  setQuestion(activeQuestion.q);
                  setIsOpen(true);
                }}
                className="text-xs font-medium text-gray-500 hover:text-black underline underline-offset-2"
              >
                Düzenle
              </button>
            </div>

            <div className="pl-8 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-xs italic">Satıcı henüz yanıtlamadı, en kısa sürede dönüş yapılacaktır...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-editorial text-xl font-semibold text-black">
                Siparişe Soru Sor
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6">
                <p className="text-sm text-gray-500 mb-4">
                  Sipariş No: <span className="font-medium text-black">#{order.id.split('-')[0]}</span> ile ilgili sormak istediğiniz soruyu aşağıya yazabilirsiniz.
                </p>
                <textarea
                  required
                  rows={4}
                  placeholder="Ürünüm ne zaman kargoya verilir? / Adresimi değiştirmek istiyorum..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                ></textarea>
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
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-black text-white text-sm font-medium uppercase tracking-wider rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Gönderiliyor..." : "Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
