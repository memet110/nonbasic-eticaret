import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const supabase = await createClient();

  // Search designs by title or description
  let designs: any[] | null = [];
  
  if (query) {
    const { data } = await supabase
      .from("designs")
      .select(`
        *,
        collections (name)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false });
      
    designs = data;
  }

  return (
    <div className="bg-stone-50 min-h-[60vh] pt-16 pb-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-12 lg:px-24">
        
        <div className="mb-12 border-b border-gray-200 pb-8">
          <h1 className="font-editorial text-4xl font-bold tracking-tight text-black mb-4">
            Arama Sonuçları
          </h1>
          <p className="text-gray-500">
            <span className="font-semibold text-black">"{query}"</span> için sonuçlar gösteriliyor.
          </p>
        </div>

        {designs && designs.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            {designs.map((design) => (
              <div key={design.id} className="break-inside-avoid group relative">
                <Link href={`/tasarim/${design.slug}`} className="block overflow-hidden bg-gray-200">
                  <img 
                    src={design.preview_image_url} 
                    alt={design.title} 
                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <p className="text-white/80 text-sm font-medium tracking-widest uppercase mb-2">
                      {design.collections?.name}
                    </p>
                    <h2 className="text-white text-3xl font-editorial font-medium mb-4">
                      {design.title}
                    </h2>
                    <div className="inline-flex items-center gap-2 text-white text-sm font-medium group/btn">
                      Bu Tasarımı Ürünlerde Gör 
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-6 text-lg">Maalesef aradığınız kriterlere uygun tasarım bulunamadı.</p>
            <Link href="/galeri" className="inline-flex items-center justify-center bg-black text-white px-8 py-3 uppercase text-sm font-medium tracking-wider hover:bg-gray-900 transition-colors">
              Tüm Galeriye Dön
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
