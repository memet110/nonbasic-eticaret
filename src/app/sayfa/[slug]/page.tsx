import { notFound } from "next/navigation";

export default async function StaticPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  // Basic content mapping
  const contentMap: Record<string, { title: string, content: React.ReactNode }> = {
    "hakkimizda": {
      title: "Hakkımızda",
      content: <p>NONBASIC, bağımsız sanatçıların eserlerini premium tekstil ve dekorasyon ürünleriyle buluşturan bir platformdur. Amacımız, sanatı galerilerden çıkarıp günlük hayatın bir parçası yapmaktır.</p>
    },
    "sss": {
      title: "Sıkça Sorulan Sorular",
      content: <p>Siparişlerim ne zaman kargoya verilir? <br/>- Tüm ürünlerimiz sipariş üzerine size özel basıldığı için üretim süresi 2-4 iş günüdür.</p>
    },
    "kargo": {
      title: "Kargo & Teslimat",
      content: <p>Türkiye'nin her yerine kargo ücretsizdir. Yurtiçi Kargo güvencesiyle teslimat yapılmaktadır.</p>
    },
    "iade": {
      title: "İade ve Değişim",
      content: <p>Özel üretim yapıldığı için ayıplı mal olmadığı sürece iade kabul edilmemektedir. Beden uyumsuzluğunda 14 gün içinde değişim yapabilirsiniz.</p>
    },
    "iletisim": {
      title: "İletişim",
      content: <p>Bize hello@nonbasic.com adresinden ulaşabilirsiniz.</p>
    },
    "mesafeli-satis": {
      title: "Mesafeli Satış Sözleşmesi",
      content: <p>MADDE 1 - TARAFLAR... (Taslak metin eklenecektir)</p>
    },
    "kvkk": {
      title: "KVKK Aydınlatma Metni",
      content: <p>Kişisel verileriniz veri sorumlusu sıfatıyla NONBASIC tarafından işlenmektedir...</p>
    }
  };

  const page = contentMap[slug];

  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 sm:px-12 py-20">
      <h1 className="font-editorial text-4xl font-bold text-black mb-8 border-b border-gray-200 pb-6">
        {page.title}
      </h1>
      <div className="prose prose-stone max-w-none text-gray-600">
        {page.content}
      </div>
    </div>
  );
}
