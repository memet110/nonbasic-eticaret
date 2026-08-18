"use client";

import { useState } from "react";
import { X } from "lucide-react";

import turkeyData from "@/utils/turkeyData.json";

type Address = {
  id: string;
  title: string;
  name: string;
  details: string;
  city: string;
  district: string;
  phone: string;
};

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      title: "Ev Adresi",
      name: "Ahmet Yılmaz",
      details: "Örnek Mahallesi, Test Sokak, No: 123 Daire: 4",
      city: "İstanbul",
      district: "Kadıköy",
      phone: "0555 555 55 55"
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Address>>({});

  const availableDistricts = formData.city 
    ? turkeyData.find(c => c.name === formData.city)?.districts || []
    : [];

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ title: "", name: "", details: "", city: "", district: "", phone: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingId(addr.id);
    setFormData(addr);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu adresi silmek istediğinize emin misiniz?")) {
      setAddresses(addresses.filter(a => a.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAddresses(addresses.map(a => a.id === editingId ? { ...a, ...formData } as Address : a));
    } else {
      setAddresses([...addresses, { ...formData, id: Date.now().toString() } as Address]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {addresses.map(addr => (
          <div key={addr.id} className="border border-gray-200 rounded-lg p-6 relative group hover:border-black transition-colors">
            <span className="absolute top-6 right-6 text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{addr.title}</span>
            <h4 className="font-semibold text-lg mb-2">{addr.name}</h4>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {addr.details}<br />
              {addr.district}, {addr.city}<br />
              {addr.phone}
            </p>
            <div className="flex gap-4">
              <button onClick={() => handleOpenEdit(addr)} className="text-sm font-medium underline hover:text-gray-500">Düzenle</button>
              <button onClick={() => handleDelete(addr.id)} className="text-sm font-medium text-red-600 underline hover:text-red-400">Sil</button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={handleOpenNew}
          className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:text-black hover:border-black transition-colors h-full min-h-[200px]"
        >
          <span className="text-3xl mb-2">+</span>
          <span className="font-medium">Yeni Adres Ekle</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative h-auto max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-editorial font-bold mb-6">
              {editingId ? "Adresi Düzenle" : "Yeni Adres Ekle"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Adres Başlığı</label>
                <input required type="text" value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ev, İş vb." className="w-full border border-gray-300 p-2 outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                <input required type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 p-2 outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">İl</label>
                  <select 
                    required 
                    value={formData.city || ""} 
                    onChange={e => setFormData({...formData, city: e.target.value, district: ""})} 
                    className="w-full border border-gray-300 p-2 outline-none focus:border-black bg-white"
                  >
                    <option value="" disabled>İl Seçin</option>
                    {turkeyData.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İlçe</label>
                  <select 
                    required 
                    value={formData.district || ""} 
                    onChange={e => setFormData({...formData, district: e.target.value})} 
                    disabled={!formData.city}
                    className="w-full border border-gray-300 p-2 outline-none focus:border-black bg-white disabled:opacity-50"
                  >
                    <option value="" disabled>İlçe Seçin</option>
                    {availableDistricts.map((dist: any) => (
                      <option key={dist.id} value={dist.name}>{dist.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açık Adres</label>
                <textarea required value={formData.details || ""} onChange={e => setFormData({...formData, details: e.target.value})} rows={3} className="w-full border border-gray-300 p-2 outline-none focus:border-black resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefon</label>
                <input required type="tel" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full border border-gray-300 p-2 outline-none focus:border-black" />
              </div>
              <button type="submit" className="w-full bg-black text-white py-3 mt-2 font-medium tracking-wider uppercase text-sm hover:bg-gray-900 transition-colors">
                Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
