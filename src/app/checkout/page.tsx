"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import turkeyData from "@/utils/turkeyData.json";

export default function CheckoutPage() {
  const { items, getTotal, clearCart, discount, applyDiscount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    setProvinces(turkeyData);
  }, []);

  // İl seçildiğinde ilçeleri güncelle
  useEffect(() => {
    if (!city) {
      setDistricts([]);
      setDistrict("");
      return;
    }
    
    const selectedProvince = provinces.find(p => p.name === city);
    if (selectedProvince && selectedProvince.districts) {
      setDistricts(selectedProvince.districts);
    }
  }, [city, provinces]);

  if (!mounted) return null;

  const total = getTotal();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal - total;

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode) return;

    const { data, error } = await supabase
      .from('coupons')
      .select('discount_type, discount_value, is_active, min_cart_amount, current_usage, max_usage')
      .eq('code', couponCode.toUpperCase())
      .single();

    if (error || !data || !data.is_active) {
      setCouponError("Geçersiz veya süresi dolmuş kupon kodu.");
      applyDiscount(null);
    } else if (data.max_usage && data.current_usage >= data.max_usage) {
      setCouponError("Bu kupon kodunun kullanım limiti dolmuş.");
      applyDiscount(null);
    } else if (data.min_cart_amount && subtotal < data.min_cart_amount) {
      setCouponError(`Bu kuponu kullanmak için sepet tutarınız en az ₺${data.min_cart_amount} olmalıdır.`);
      applyDiscount(null);
    } else {
      applyDiscount({
        type: data.discount_type as 'percentage' | 'fixed',
        value: data.discount_value,
        code: couponCode.toUpperCase()
      });
      setCouponSuccess(
        data.discount_type === 'percentage' 
          ? `%${data.discount_value} indirim uygulandı!` 
          : `₺${data.discount_value} indirim uygulandı!`
      );
    }
  };

  const handleCheckout = async () => {
    if (!email || !firstName || !lastName || !address || !city || !district) {
      alert("Lütfen tüm adres ve iletişim bilgilerini eksiksiz doldurun.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Sipariş Başlığını Oluştur (Ödeme Bekleniyor olarak)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user ? user.id : null,
          customer_name: `${firstName} ${lastName}`,
          customer_email: email,
          customer_phone: phone,
          shipping_address: address,
          city: city,
          district: district,
          total_amount: total,
          status: "Baskı Bekleyen",
          payment_status: "Ödeme Bekleniyor",
          applied_coupon: discount?.code || null,
          discount_amount: discountAmount
        })
        .select()
        .single();

      if (orderError) {
        console.error("Sipariş veritabanına yazılamadı:", orderError);
        alert("Veritabanı hatası: Sipariş oluşturulamadı. Lütfen RLS ayarlarınızı kontrol edin.");
        setIsSubmitting(false);
        return;
      }

      // 2. Sipariş Kalemlerini Ekle
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        product_slug: item.slug,
        product_type: item.productType,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.price,
        image_url: item.image
      }));
      await supabase.from("order_items").insert(orderItemsData);

      // 3. Iyzico'dan Formu Al
      const response = await fetch("/api/iyzico/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: order.id, // Supabase order_id'yi Iyzico'ya gönderiyoruz
          price: total,
          buyer: {
            name: firstName,
            surname: lastName,
            email: email,
            phone: phone,
            address: address,
            city: city,
          },
          basketItems: items.map(item => ({
            id: item.id,
            name: item.name,
            category1: item.productType,
            price: item.price * item.quantity
          }))
        })
      });

      const data = await response.json();

      if (data.error) {
        alert("Ödeme başlatılamadı: " + data.error);
        setIsSubmitting(false);
        return;
      }

      // Iyzico HTML snippet'i sayfaya ekleyip popup'ı tetikle
      const iyziWindow = document.getElementById("iyzipay-checkout-form");
      if (iyziWindow) {
        iyziWindow.innerHTML = data.checkoutFormContent + '<script id="iyzi-script">' + data.checkoutFormContent.match(/<script\b[^>]*>([\s\S]*?)<\/script>/m)[1] + '</script>';
        // Scriptin calismasi icin eval kullanilabilir veya Next.js router disinda inject edilebilir.
        // Iyzico div icindeki scripti otomatik calistirmak uzere "append" edelim:
        const scriptElement = document.createElement("script");
        scriptElement.innerHTML = data.checkoutFormContent.match(/<script\b[^>]*>([\s\S]*?)<\/script>/m)?.[1] || "";
        document.body.appendChild(scriptElement);
      }

    } catch (error) {
      console.error("Ödeme başlatılırken hata:", error);
      alert("İşlem sırasında bir hata oluştu.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-24 py-12">
      <Link href="/sepet" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8">
        <ArrowLeft className="h-4 w-4" />
        Sepete Dön
      </Link>
      
      <div className="flex items-center gap-3 mb-12 border-b border-gray-200 pb-8">
        <Lock className="h-6 w-6 text-black" />
        <h1 className="font-editorial text-3xl font-bold tracking-tight text-black">
          Güvenli Ödeme
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Checkout Form */}
        <div className="lg:col-span-7 space-y-12">
          
          <section>
            <h2 className="text-lg font-medium text-black mb-6">İletişim Bilgileri</h2>
            <div className="grid grid-cols-1 gap-y-6">
              <input 
                type="email" 
                placeholder="E-posta Adresi" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 p-4 outline-none focus:border-black transition-colors" 
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black mb-6">Teslimat Adresi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input 
                type="text" 
                placeholder="Ad" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 p-4 outline-none focus:border-black transition-colors" 
              />
              <input 
                type="text" 
                placeholder="Soyad" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 p-4 outline-none focus:border-black transition-colors" 
              />
              <input 
                type="text" 
                placeholder="Telefon (Sadece Rakam)" 
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Sadece rakam
                  setPhone(val);
                }}
                className="w-full sm:col-span-2 border border-gray-300 p-4 outline-none focus:border-black transition-colors" 
              />
              <div className="w-full sm:col-span-2">
                <textarea 
                  rows={3} 
                  placeholder="Açık Adres" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-300 p-4 outline-none focus:border-black transition-colors"
                ></textarea>
              </div>
              <select 
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setDistrict("");
                }}
                className="w-full border border-gray-300 p-4 outline-none focus:border-black transition-colors bg-white" 
              >
                <option value="" disabled>İl Seçin</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <select 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!city || districts.length === 0}
                className="w-full border border-gray-300 p-4 outline-none focus:border-black transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400" 
              >
                <option value="" disabled>İlçe Seçin</option>
                {districts.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black mb-6">Ödeme Bilgileri (Iyzico Güvencesiyle)</h2>
            <div className="bg-stone-50 border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[200px]">
              <p className="text-gray-500 text-sm text-center mb-6">Güvenli ödeme altyapısı Iyzico üzerinden sağlanmaktadır.</p>
              
              <button 
                onClick={handleCheckout}
                disabled={isSubmitting || items.length === 0}
                className="bg-black text-white px-8 py-4 uppercase text-sm font-medium tracking-wider hover:bg-gray-900 transition-colors disabled:opacity-50 w-full md:w-auto"
              >
                {isSubmitting ? "Ödeme Ekranı Yükleniyor..." : `Ödeme Yap (₺${total},00)`}
              </button>

              <div id="iyzipay-checkout-form" className="responsive w-full mt-8"></div>
            </div>
          </section>

        </div>

        {/* Mini Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-stone-50 border border-gray-100 p-8">
            <h2 className="text-lg font-medium text-black mb-6">Sipariş Özeti</h2>
            <ul className="divide-y divide-gray-200 border-t border-b border-gray-200 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {items.map(item => (
                <li key={item.id} className="flex py-4 gap-4">
                  <div className="h-20 w-16 bg-gray-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-medium text-black capitalize">{item.name} - {item.productType} ({item.size})</p>
                    <p className="text-sm text-gray-500 mt-1">{item.quantity} Adet</p>
                  </div>
                  <div className="flex flex-col justify-center text-right">
                    <p className="text-sm font-medium text-black">₺{item.price * item.quantity},00</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  placeholder="Kupon Kodu (Örn: TEST15)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black uppercase" 
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon}
                  className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-900 transition-colors"
                >
                  Uygula
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
              {couponSuccess && <p className="text-green-600 text-xs mt-1">{couponSuccess}</p>}
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <p>Ara Toplam</p>
              <p>₺{subtotal},00</p>
            </div>
            {discount && (
              <div className="flex justify-between text-sm text-green-600 mb-2">
                <p>İndirim ({discount.type === 'percentage' ? `%${discount.value}` : `₺${discount.value}`})</p>
                <p>-₺{discountAmount}</p>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
              <p>Kargo (Sabit)</p>
              <p>Ücretsiz</p>
            </div>
            <div className="flex justify-between text-base font-bold text-black">
              <p>Ödenecek Tutar</p>
              <p>₺{total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
