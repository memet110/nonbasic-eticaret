"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight } from "lucide-react";

export function ProfileManager({ user }: { user: any }) {
  const supabase = createClient();
  
  // Profile State
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
  const [phone, setPhone] = useState(user.user_metadata?.phone || "");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password State
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileMsg("");

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone: phone,
      }
    });

    if (error) {
      setProfileMsg("Güncelleme hatası: " + error.message);
    } else {
      setProfileMsg("Profiliniz başarıyla güncellendi.");
    }
    setIsProfileLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordMsg("");

    if (password !== passwordConfirm) {
      setPasswordMsg("Şifreler uyuşmuyor.");
      setIsPasswordLoading(false);
      return;
    }

    if (password.length < 6) {
      setPasswordMsg("Şifre en az 6 karakter olmalıdır.");
      setIsPasswordLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setPasswordMsg("Şifre değiştirme hatası: " + error.message);
    } else {
      setPasswordMsg("Şifreniz başarıyla değiştirildi.");
      setPassword("");
      setPasswordConfirm("");
    }
    setIsPasswordLoading(false);
  };

  return (
    <div className="space-y-12">
      {/* Profile Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl">
        <h4 className="font-editorial text-xl font-semibold mb-6">Kişisel Bilgiler</h4>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ad Soyad</label>
              <input 
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-300 p-3 outline-none focus:border-black transition-colors" 
                placeholder="Adınız Soyadınız" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">E-posta Adresi</label>
              <input type="email" disabled value={user.email} className="w-full border border-gray-200 bg-gray-50 p-3 text-gray-500 cursor-not-allowed" />
              <p className="text-xs text-gray-500">E-posta adresiniz güvenlik sebebiyle değiştirilemez.</p>
            </div>
          </div>
          <div className="space-y-2 max-w-[50%]">
            <label className="text-sm font-medium text-gray-700">Telefon Numarası</label>
            <input 
              type="tel" 
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-gray-300 p-3 outline-none focus:border-black transition-colors" 
              placeholder="05XX XXX XX XX" 
            />
          </div>
          
          {profileMsg && (
            <p className={`text-sm ${profileMsg.includes('hata') ? 'text-red-500' : 'text-green-600'}`}>
              {profileMsg}
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={isProfileLoading}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-medium tracking-wider text-sm uppercase hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {isProfileLoading ? "Güncelleniyor..." : "Bilgilerimi Güncelle"}
          </button>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl">
        <h4 className="font-editorial text-xl font-semibold mb-6">Şifre Değiştir</h4>
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Yeni Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 outline-none focus:border-black transition-colors" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Yeni Şifre (Tekrar)</label>
              <input 
                type="password" 
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className="w-full border border-gray-300 p-3 outline-none focus:border-black transition-colors" 
                required
              />
            </div>
          </div>

          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.includes('hata') || passwordMsg.includes('uyuşmuyor') || passwordMsg.includes('karakter') ? 'text-red-500' : 'text-green-600'}`}>
              {passwordMsg}
            </p>
          )}

          <button 
            type="submit" 
            disabled={isPasswordLoading}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-medium tracking-wider text-sm uppercase hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {isPasswordLoading ? "Güncelleniyor..." : "Şifremi Değiştir"}
          </button>
        </form>
      </div>
    </div>
  );
}
