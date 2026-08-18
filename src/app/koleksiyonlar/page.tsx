import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Koleksiyonlar | NONBASIC",
  description: "Sanatçılarımız tarafından özenle hazırlanan özgün koleksiyonlarımızı keşfedin.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CollectionsPage() {
  const supabase = await createClient();

  // Fetch all collections
  const { data: collections } = await supabase
    .from("collections")
    .select('*')
    .order("name", { ascending: true });

  return (
    <div className="bg-stone-50 min-h-screen pt-24 pb-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-12 lg:px-24">
        
        {/* Header */}
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <h1 className="font-editorial text-5xl md:text-6xl font-bold tracking-tight text-black mb-6">
            Koleksiyonlarımız
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Bizim için tişörtler veya kupalar sadece birer kanvas. 
            Burada, özenle yaratılmış koleksiyonlarımızı çerçevesiz bir şekilde, 
            kendi doğal halleriyle inceleyebilirsiniz.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {collections?.map((col) => {
            // Default image if no cover_image_url
            const coverImage = col.cover_image_url || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop";
            
            return (
              <div key={col.id} className="group relative">
                <Link href={`/kategori/${col.slug}`} className="block overflow-hidden bg-gray-200 aspect-[4/5] rounded-xl relative shadow-sm hover:shadow-xl transition-shadow">
                  <img 
                    src={coverImage} 
                    alt={col.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  
                  {/* Overlay Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <h2 className="text-white text-3xl font-editorial font-medium mb-3">
                      {col.name}
                    </h2>
                    <div className="inline-flex items-center gap-2 text-white/90 text-sm font-medium group/btn">
                      Koleksiyonu İncele 
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
