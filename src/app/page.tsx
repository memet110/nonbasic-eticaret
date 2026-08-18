import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { DesignCard } from "@/components/product/DesignCard";
import { HeroCanvas } from "@/components/canvas/HeroCanvas";

export default async function Home() {
  const supabase = await createClient();
  const { data: designs } = await supabase
    .from('designs')
    .select('*, collections(name)')
    .limit(3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex h-[80vh] min-h-[600px] w-full items-center justify-center bg-stone-100 overflow-hidden cursor-none">
        <div className="absolute inset-0 z-0">
          <HeroCanvas />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-12 lg:px-24 max-w-5xl mx-auto w-full">
          <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-tight drop-shadow-lg">
            Sanatı Giy.
          </h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mb-12 font-sans font-medium drop-shadow-md">
            Premium kalitede temel parçalar, bağımsız sanatçıların özgün tasarımlarıyla buluşuyor.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link 
              href="/kategori/tumu" 
              className="group flex items-center justify-center gap-3 bg-white text-black px-10 py-5 hover:bg-gray-100 transition-colors duration-300 font-medium tracking-wider text-sm uppercase shadow-lg"
            >
              Tüm Ürünler
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Designs (Galeri Tarzı) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black">
            Öne Çıkan Eserler
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl font-sans">
            Her tasarım, onu taşıyacak ürünlerden bağımsız olarak kendi hikayesini anlatır.
          </p>
        </div>

        {designs && designs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 bg-gray-50 py-12 border border-gray-200">
            Veritabanı bağlantısı başarılı ancak veriler yüklenmemiş. Lütfen Supabase panelinden SQL komutunu çalıştırın.
          </div>
        )}
        
        <div className="mt-16 flex justify-center">
          <Link 
            href="/kategori/tumu" 
            className="inline-flex items-center gap-2 border-b-2 border-black pb-1 font-medium text-black hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            Tüm Ürünleri İncele
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
