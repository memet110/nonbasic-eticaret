import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";

export default async function FavoritesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris");
  }

  // Fetch favorites joined with designs
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      id,
      designs (
        id,
        title,
        slug,
        preview_image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-[1400px] px-6 sm:px-12 lg:px-24 py-16 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-12 border-b border-gray-200 pb-8">
        <Heart className="h-8 w-8 text-black fill-black" />
        <h1 className="font-editorial text-4xl font-bold tracking-tight text-black">
          Favorilerim
        </h1>
      </div>

      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {favorites.map((fav: any) => {
            const design = Array.isArray(fav.designs) ? fav.designs[0] : fav.designs;
            if (!design) return null;
            return (
              <Link 
                key={fav.id} 
                href={`/tasarim/${design.slug}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                  <img 
                    src={design.preview_image_url} 
                    alt={design.title} 
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-black group-hover:underline decoration-1 underline-offset-4">
                  {design.title}
                </h3>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-stone-50 border border-gray-200 rounded-lg">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6 text-lg">Henüz hiç favori tasarımınız bulunmuyor.</p>
          <Link href="/kategori/giyim" className="inline-flex items-center justify-center bg-black text-white px-8 py-3 uppercase text-sm font-medium tracking-wider hover:bg-gray-900 transition-colors">
            Tasarımları Keşfet
          </Link>
        </div>
      )}
    </div>
  );
}
