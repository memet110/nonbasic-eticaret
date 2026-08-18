"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessageCircle, Send, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminOrderReply({ order }: { order: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Parse history from customer_question
  const history = useMemo(() => {
    if (!order.customer_question) return [];
    try {
      const parsed = JSON.parse(order.customer_question);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
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

  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setReply(activeQuestion?.a || "");
  }, [activeQuestion?.a]);

  const handleSubmit = async () => {
    if (!reply.trim() || !activeQuestion) return;
    
    setIsSubmitting(true);
    
    // Update the last question in the history array
    const updatedHistory = [...history];
    updatedHistory[updatedHistory.length - 1].a = reply;

    const { error } = await supabase
      .from("orders")
      .update({ 
        customer_question: JSON.stringify(updatedHistory),
        admin_reply: reply // Legacy column just in case
      })
      .eq("id", order.id);

    setIsSubmitting(false);

    if (error) {
      alert("Yanıt gönderilirken hata oluştu: " + error.message);
    } else {
      setReply("");
      router.refresh();
    }
  };

  if (history.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2">
      {/* Accordion for Answered Questions */}
      {answeredQuestions.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {answeredQuestions.map((item: any) => (
            <div key={item.id} className="border border-orange-200 rounded-md overflow-hidden bg-white">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-3 py-2 flex justify-between items-center bg-orange-50 hover:bg-orange-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2 truncate flex-1 pr-4">
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase tracking-wider border border-green-200 flex-shrink-0">Cevaplandı</span>
                  <span className="text-xs text-orange-800 truncate max-w-[40%]">{item.q}</span>
                  <span className="text-xs text-orange-300 flex-shrink-0 mx-1">-</span>
                  <span className="text-xs text-orange-600 truncate flex-1">{item.a}</span>
                </div>
                {expandedId === item.id ? <ChevronUp className="w-4 h-4 text-orange-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-orange-500 flex-shrink-0" />}
              </button>
              
              {expandedId === item.id && (
                <div className="p-3 border-t border-orange-200 bg-white space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 block mb-1">Müşteri Sorusu:</span>
                    <p className="text-sm text-gray-800 break-words">{item.q}</p>
                  </div>
                  <div className="pt-2 border-t border-orange-100">
                    <span className="text-xs font-semibold text-orange-600 block mb-1">Eski Yanıtınız:</span>
                    <p className="text-sm text-gray-800 break-words">{item.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Active Question Reply Box (Only if there is an unanswered question) */}
      {activeQuestion && (
        <div className="p-4 bg-orange-50 rounded-md border border-orange-200">
          <div className="flex items-start gap-3 mb-3">
            <MessageCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-900">Bekleyen Müşteri Sorusu:</p>
              <p className="text-sm text-orange-800 mt-1">{activeQuestion.q}</p>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <textarea
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Müşteriye yanıtınız..."
              className="flex-1 border border-orange-200 rounded-md p-2 text-sm outline-none focus:border-orange-400 bg-white"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !reply.trim()}
              className="flex flex-col items-center justify-center px-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 mb-1" />
              <span className="text-[10px] uppercase tracking-wider">Yanıtla</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
