"use client";

import { CheckCircle, XCircle } from "lucide-react";

export function CustomerReturnStatus({ order }: { order: any }) {
  if (!order.return_request) return null;

  const req = order.return_request;
  
  // Sadece iade kabul edildi veya reddedildi durumlarında gösteriyoruz
  if (order.status !== "İade Kabul Edildi" && order.status !== "İade Reddedildi") return null;

  const isAccepted = order.status === "İade Kabul Edildi";

  return (
    <div className={`w-full rounded-lg p-5 border ${
      isAccepted ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        {isAccepted ? (
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        )}
        <h4 className={`text-lg font-editorial font-semibold ${
          isAccepted ? 'text-emerald-900' : 'text-red-900'
        }`}>
          {isAccepted ? 'İade Talebiniz Onaylandı' : 'İade Talebiniz Reddedildi'}
        </h4>
      </div>
      
      <div className="pl-9 space-y-2">
        <p className={`text-sm ${isAccepted ? 'text-emerald-800' : 'text-red-800'}`}>
          {req.admin_note || (isAccepted 
            ? "Talebiniz kabul edilmiştir. Kargo süreciyle ilgili bilgilendirme e-postası alacaksınız." 
            : "Talebiniz iade politikalarımıza uygun bulunmadığı için reddedilmiştir.")}
        </p>
        
        <p className="text-xs opacity-70 mt-4 block">
          Talep Tarihi: {new Date(req.date).toLocaleDateString('tr-TR')}
        </p>
      </div>
    </div>
  );
}
