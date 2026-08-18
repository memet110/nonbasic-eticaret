"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function AdminOrderReturnInfo({ order }: { order: any }) {
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  if (!order.return_request) return null;

  const req = order.return_request;
  const isPending = order.status === "İade Talebi Alındı";

  const handleSubmit = async () => {
    if (!action || !note.trim()) return;
    setIsSubmitting(true);

    const newStatus = action === "accept" ? "İade Kabul Edildi" : "İade Reddedildi";
    const updatedReturnRequest = {
      ...req,
      admin_note: note,
      admin_status: action
    };

    const { error } = await supabase
      .from("orders")
      .update({
        return_request: updatedReturnRequest,
        status: newStatus
      })
      .eq("id", order.id);

    setIsSubmitting(false);

    if (error) {
      alert("İşlem sırasında hata oluştu: " + error.message);
    } else {
      setAction(null);
      setNote("");
      router.refresh();
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">İade Talebi Detayları</span>
      </div>
      <div className="text-sm space-y-1 mb-4">
        <p className="text-gray-700"><span className="font-semibold">Neden:</span> {req.reason}</p>
        {req.description && (
          <p className="text-gray-700"><span className="font-semibold">Açıklama:</span> {req.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">Tarih: {new Date(req.date).toLocaleString('tr-TR')}</p>
      </div>

      {isPending && !action && (
        <div className="flex gap-2 border-t border-gray-200 pt-3">
          <button 
            onClick={() => {
              setAction("accept");
              setNote("Yurtiçi Kargo İade Kodu: 123456789. Lütfen ürünü faturasıyla birlikte hasarsız bir şekilde kargoya teslim ediniz.");
            }}
            className="flex-1 flex items-center justify-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold py-2 rounded transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Onayla
          </button>
          <button 
            onClick={() => setAction("reject")}
            className="flex-1 flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold py-2 rounded transition-colors"
          >
            <XCircle className="w-4 h-4" /> Reddet
          </button>
        </div>
      )}

      {action && (
        <div className="border-t border-gray-200 pt-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {action === "accept" ? "İade Kargo Bilgileri / Notunuz:" : "Ret Nedeni (Müşteriye Gösterilecek):"}
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-black mb-2"
            placeholder={action === "accept" ? "Kargo firması ve iade kodu giriniz..." : "Talebin neden reddedildiğini açıklayın..."}
          />
          <div className="flex gap-2">
            <button 
              onClick={() => setAction(null)}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-black"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !note.trim()}
              className="flex-1 bg-black text-white text-xs font-medium py-1.5 rounded disabled:opacity-50"
            >
              {isSubmitting ? "Kaydediliyor..." : "İşlemi Tamamla"}
            </button>
          </div>
        </div>
      )}

      {/* Önceden İşlem Yapılmışsa Sonucu Göster */}
      {!isPending && req.admin_status && (
        <div className={`mt-3 p-3 rounded-md border ${req.admin_status === 'accept' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-xs font-bold mb-1 ${req.admin_status === 'accept' ? 'text-emerald-800' : 'text-red-800'}`}>
            {req.admin_status === 'accept' ? '✓ İade Onaylandı' : '✗ İade Reddedildi'}
          </p>
          <p className="text-sm text-gray-700">{req.admin_note}</p>
        </div>
      )}
    </div>
  );
}
