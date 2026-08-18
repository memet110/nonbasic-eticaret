# Proje Spesifikasyonu: Sanat Tasarımlı Ürün E-Ticaret Sitesi

## 1. Proje Özeti

Türkiye pazarına yönelik bir e-ticaret sitesi geliştiriliyor. İş modeli: **temel/basic ürünler** (beyaz, siyah ve farklı renklerde tişört, sweatshirt, mug, dekorasyon ürünleri) üzerine **özgün sanat tasarımları** baskılanarak satılıyor. Asıl ürün değeri tasarımdır — ürün sadece bir "taşıyıcı"dır.

**Üretim modeli:** Print-on-demand mantığı ama dış servise bağlı değil — sipariş geldiğinde işletme sahibi kendi ekipmanıyla baskıyı yapıp kargoluyor. Bu nedenle sistemde bir **üretim kuyruğu (production queue)** ekranı olmalı: aynı tasarım/beden kombinasyonunu içeren tüm bekleyen siparişleri toplu gösteren bir görünüm.

**Hedef pazar:** Sadece Türkiye. Para birimi TRY, dil Türkçe, KDV dahil fiyatlandırma.

**Tasarım hedefi:** Premium, sanat galerisi hissi veren, bol boşluklu, yüksek kaliteli görsel odaklı bir arayüz. Şablon/temaya benzemeyen, özgün bir görsel kimlik.

---

## 2. Teknoloji Yığını

- **Frontend/Backend:** Next.js (App Router) — SSR/SSG ile SEO avantajı
- **Veritabanı:** PostgreSQL (Supabase üzerinden — auth, storage ve DB tek yerden)
- **Kimlik doğrulama:** Supabase Auth (e-posta/şifre + Google ile giriş)
- **Görsel barındırma/CDN:** Cloudinary (tasarım dosyaları, ürün mockup görselleri, otomatik optimize/responsive görsel teslimi)
- **Mockup üretimi:** Printful Mockup Generator API (yalnızca görsel oluşturma amaçlı, fulfillment KULLANILMAYACAK — sipariş üretimi tamamen manuel/kendi baskı sürecinde)
- **Ödeme:** iyzico (Türkiye için taksit destekli, 3D Secure)
- **Kargo:** Faz 1'de manuel takip numarası girişi; Faz 2'de Yurtiçi Kargo / Aras Kargo API entegrasyonu
- **E-posta:** Resend veya benzeri (sipariş onay/durum bildirimleri)
- **Hosting:** Vercel

---

## 3. Site Haritası (Müşteri Tarafı)

### 3.1 Anasayfa
- Hero alanı: öne çıkan tasarım/koleksiyon, güçlü görsel + net CTA
- Öne çıkan tasarımlar / yeni gelenler bölümü
- Kategori kartları (Tişört, Sweatshirt, Mug, Dekorasyon)
- Marka hikayesi kısa özeti
- Newsletter kayıt formu

### 3.2 Kategori / Listeleme Sayfaları
- Ürün tipi filtresi (tişört, sweatshirt, mug, poster vb.)
- Tasarım teması/koleksiyon filtresi
- Renk, beden, fiyat aralığı filtreleri
- Sıralama: yeni, popüler, fiyat artan/azalan
- Sonsuz kaydırma veya sayfalama

### 3.3 Tasarım Galerisi (opsiyonel ama önerilir)
Tasarımların kendisinin de gezilebildiği bir galeri — kullanıcı önce tasarımı beğenip sonra "bu tasarım hangi ürünlerde var" şeklinde ilerleyebilmeli. Bu, "biz ürün değil tasarım satıyoruz" konumlandırmasını güçlendirir.

### 3.4 Ürün Detay Sayfası
- Büyük görsel galeri (mockup görselleri, farklı açılar)
- Ürün tipi seçimi (aynı tasarım farklı ürünlerde: "Bu tasarımı sweatshirt üzerinde de gör")
- Renk seçici (gerçek zamanlı mockup güncellemesi hedef)
- Beden seçici + beden tablosu
- Fiyat, stok durumu (blank ürün stoğuna bağlı)
- Sepete ekle / favorilere ekle
- Tasarımcı/koleksiyon bilgisi, tasarım açıklaması
- İlgili/benzer tasarımlar

### 3.5 Sepet & Checkout
- Sepet: ürün, adet, beden/renk düzenleme, kupon kodu alanı
- Checkout: misafir olarak devam VEYA üyelik ile devam
- Adres formu (Türkiye il/ilçe seçimi)
- Ödeme: iyzico entegrasyonu, taksit seçenekleri
- Sipariş özeti ve onay e-postası

### 3.6 Hesabım
- Sipariş geçmişi ve durumu (baskıya hazır / baskıda / kargolandı / teslim edildi)
- Kayıtlı adresler
- Favori tasarımlar/ürünler
- Hesap bilgileri düzenleme

### 3.7 Statik / Yasal Sayfalar (Türkiye'de zorunlu)
- Hakkımızda
- SSS
- Kargo & Teslimat Bilgisi
- İade ve Değişim Koşulları
- Mesafeli Satış Sözleşmesi
- Cayma Formu
- KVKK Aydınlatma Metni
- Çerez Politikası
- Kullanım Koşulları
- İletişim (form + adres)

---

## 4. Admin Panel

### 4.1 Dashboard
- Günlük/haftalık/aylık satış özeti
- Bekleyen sipariş sayısı, baskı bekleyen adet
- En çok satan tasarımlar/ürünler

### 4.2 Ürün Yönetimi
- Temel ürün tipi tanımlama (tişört, sweatshirt, mug, poster...) + varyant matrisi (renk × beden)
- Blank ürün stok girişi/takibi (baskı yapılmamış ham ürün stoğu)
- Fiyatlandırma (ürün tipi bazlı taban fiyat)

### 4.3 Tasarım Yönetimi
- Yüksek çözünürlüklü baskı dosyası yükleme (üretimde kullanılacak asıl dosya — müşteriye gösterilen görselden AYRI tutulmalı)
- Tasarımın hangi ürün tiplerinde satışa açılacağının seçimi
- Otomatik mockup üretimi (Printful Mockup API tetikleme)
- Kategori/koleksiyon etiketleme

### 4.4 Sipariş Yönetimi
- Sipariş listesi, filtreleme (durum, tarih, ödeme durumu)
- Durum akışı: **Ödeme Alındı → Baskıya Hazır → Baskıda → Kargoya Hazır → Kargolandı → Teslim Edildi → İptal/İade**
- Her sipariş için yüksek çözünürlüklü baskı dosyasını indirme linki
- Kargo takip numarası girme, müşteriye otomatik bildirim

### 4.5 Üretim Kuyruğu (KRİTİK ÖZEL ÖZELLİK)
- Bekleyen tüm siparişleri tasarım + ürün tipi + beden bazında gruplayan görünüm
  - Örnek: "Tasarım X / Sweatshirt / L beden → 4 adet bekliyor"
- Baskı tamamlandığında toplu "baskıya hazır" işaretleme
- Baskı dosyalarını toplu indirme

### 4.6 Müşteri Yönetimi
- Müşteri listesi, sipariş geçmişi görüntüleme

### 4.7 Kampanya/Kupon Yönetimi
- Yüzde/tutar bazlı kupon oluşturma, tarih/kullanım limiti

### 4.8 İçerik Yönetimi
- Anasayfa banner/öne çıkan koleksiyon düzenleme

---

## 5. Veritabanı Şeması (Taslak)

```
users (id, email, name, phone, created_at)
addresses (id, user_id, title, city, district, full_address, zip)
designs (id, title, description, print_file_url, preview_image_url, collection_id, created_at)
collections (id, name, slug, description)
product_types (id, name, slug, base_price, print_area_spec)
product_variants (id, product_type_id, design_id, color, size, sku, stock_qty, price)
orders (id, user_id, status, total, payment_status, shipping_address_id, tracking_number, created_at)
order_items (id, order_id, product_variant_id, quantity, unit_price)
coupons (id, code, discount_type, discount_value, valid_from, valid_until, usage_limit)
favorites (id, user_id, design_id)
```

---

## 6. Tasarım/UI Yönergeleri (Premium His İçin)

- Bol negatif alan (whitespace), sıkışık değil nefes alan bir düzen
- Tipografi: en fazla 2 font ailesi, biri sanat/editorial hissi veren bir serif veya karakterli sans-serif başlık fontu, diğeri okunaklı gövde fontu
- Ürün görselleri büyük, yüksek kalite, tutarlı arka plan/stüdyo ışığı hissi
- Renk paleti: nötr bir zemin (kırık beyaz/açık gri veya koyu tema) + tasarımların kendi renklerinin öne çıkmasına izin veren sade marka rengi
- Mikro-etkileşimler: hover'da yumuşak geçişler, sayfa geçişlerinde akıcı animasyon — abartısız
- Mobil öncelikli tasarım (Türkiye'de mobil ticaret oranı yüksek)
- Şablon hissi vermeyecek özgün bir grid/kart tasarımı — jenerik e-ticaret temalarından kaçınılmalı

### 6.1 Tasarım Referansları (Antigravity İçin Görsel Yönlendirme)

Aşağıdaki siteler, bu projenin ihtiyacı için değerlendirilip seçildi. Her biri farklı bir amaç için referans alınmalı — birebir kopyalanmamalı, "en iyi yanları sentezlenmeli":

**1. Threadless — https://www.threadless.com**
En yakın iş modeli örneği: tasarımı ürünün önüne koyan galeri tarzı sunum, "sanatçı/tasarım bazlı" gezinme. **Öncelikli referans:** kategori/ürün grid yapısı ve bilgi mimarisi (tasarım → hangi ürünlerde mevcut akışı).

**2. Society6 — https://society6.com**
Aynı tasarımın onlarca farklı ürün üzerinde nasıl sunulacağına dair en net örnek. **Öncelikli referans:** ürün detay sayfasında "bu tasarımı [ürün] üzerinde de gör" geçiş mekanizması.

**3. Online Ceramics — https://onlineceramics.net**
Sanat/tasarım ağırlıklı, editoryal ve premium hissi en güçlü olan bağımsız marka örneği — şablon hissi vermiyor, kendine has bir kimliği var. **Öncelikli referans:** genel atmosfer, fotoğrafçılık stili, marka kişiliği (bu projenin "premium" hedefine en yakın duygu).

**4. Gymshark — https://www.gymshark.com**
Büyük ölçekli, iyi optimize edilmiş bir DTC (Direct-to-Consumer) markası. **Öncelikli referans:** ürün detay sayfası UX detayları — sticky sepete ekle butonu (mobilde), beden seçici, yüksek kontrastlı ürün fotoğrafçılığı.

**5. Awwwards E-ticaret Koleksiyonu — https://www.awwwards.com/websites/e-commerce/**
Tek bir site değil, ödüllü e-ticaret sitelerinin güncel bir koleksiyonu. **Öncelikli referans:** anasayfa hero bölümü ve genel "ilk izlenim" için ek ilham taraması — Antigravity'ye "bu koleksiyonu gez, hero bölümü için 2-3 farklı yaklaşım öner" şeklinde bir görev olarak da verilebilir.

**Öncelik sırası (en çok ağırlık verilmesi gereken sıra):** Online Ceramics (genel his ve marka kimliği) → Threadless (bilgi mimarisi) → Society6 (ürün-tasarım ilişkisi) → Gymshark (PDP/UX detayları) → Awwwards (ek ilham).

**Antigravity'ye verilecek örnek talimat:**
> "Aşağıdaki sitelerin tasarım dilini incele: [linkler]. Online Ceramics'in genel premium/editoryal atmosferini, Threadless'ın kategori grid yapısını ve Gymshark'ın ürün detay sayfası UX'ini referans al. Hiçbirini birebir kopyalama — bu üçünün güçlü yanlarını bizim marka kimliğimizle (sanat galerisi hissi, sade ve bol boşluklu) birleştirerek özgün bir tasarım öner."

---

## 7. Faz Planı

**Faz 1 — MVP**
- Temel ürün kataloğu (3-4 ürün tipi), 10-15 tasarım
- Sepet + misafir checkout + iyzico ödeme
- Admin: manuel sipariş listesi ve durum güncelleme
- Yasal sayfalar (zorunlu metinler)

**Faz 2 — Operasyon**
- Üyelik sistemi, favoriler
- Üretim kuyruğu ekranı
- Kupon sistemi
- Otomatik mockup üretimi (Printful API)
- Kargo API entegrasyonu

**Faz 3 — Büyüme**
- Blog/SEO içerik altyapısı
- Tasarım galerisi / öneri sistemi
- Yeni ürün kategorileri için kolay genişleme altyapısı

---

## 8. Notlar

- Yüksek çözünürlüklü baskı dosyaları ile müşteriye gösterilen önizleme görselleri kesinlikle ayrı saklanmalı (baskı dosyasına public erişim olmamalı).
- Stok takibi "blank ürün" (baskısız ham ürün) seviyesinde yapılmalı, tasarım bazında değil — çünkü aynı beyaz tişört stoğu birden fazla tasarım için kullanılabilir.
- Tüm fiyatlar KDV dahil gösterilmeli (Türkiye tüketici mevzuatı).
