"use client";

import { useState } from "react";
import { updateOrderStatus } from "./actions";

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    setLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      alert("Durum güncellenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={loading}
        className={`text-xs font-semibold rounded-full px-2 py-1 outline-none border border-transparent focus:border-gray-300 ${
          currentStatus === 'Baskı Bekleyen' ? 'bg-yellow-100 text-yellow-800' : 
          currentStatus === 'Kargolandı' ? 'bg-green-100 text-green-800' : 
          currentStatus === 'Teslim Edildi' ? 'bg-gray-100 text-gray-800' :
          currentStatus === 'İade Talebi Alındı' ? 'bg-orange-100 text-orange-800' :
          currentStatus === 'İade Kabul Edildi' ? 'bg-emerald-100 text-emerald-800' :
          currentStatus === 'İade Reddedildi' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}
      >
        <option value="Ödeme Bekleniyor">Ödeme Bekleniyor</option>
        <option value="Ödendi">Ödendi</option>
        <option value="Baskı Bekleyen">Baskı Bekleyen</option>
        <option value="Baskıda">Baskıda</option>
        <option value="Kargolandı">Kargolandı</option>
        <option value="Teslim Edildi">Teslim Edildi</option>
        <option value="İade Talebi Alındı">İade Talebi Alındı</option>
        {currentStatus === "İade Kabul Edildi" && <option value="İade Kabul Edildi">İade Kabul Edildi</option>}
        {currentStatus === "İade Reddedildi" && <option value="İade Reddedildi">İade Reddedildi</option>}
        <option value="İptal Edildi">İptal Edildi</option>
      </select>
      {loading && <span className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-black rounded-full"></span>}
    </div>
  );
}
