import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function LookbookPage() {
  const supabase = await createClient();
  const { data: designs } = await supabase
    .from('designs')
    .select('slug, title, preview_image_url')
    .limit(10);

  // We duplicate some designs with different aspect ratios to create a masonry-like grid
  const lookbookItems = [
    { id: 1, type: "portrait", colSpan: "col-span-1", rowSpan: "row-span-2", img: designs?.[0]?.preview_image_url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop", title: designs?.[0]?.title, slug: designs?.[0]?.slug },
    { id: 2, type: "landscape", colSpan: "col-span-2", rowSpan: "row-span-1", img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop", title: designs?.[1]?.title, slug: designs?.[1]?.slug },
    { id: 3, type: "square", colSpan: "col-span-1", rowSpan: "row-span-1", img: designs?.[2]?.preview_image_url || "https://images.unsplash.com/photo-1434389678278-dfa4c281bc11?q=80&w=1000&auto=format&fit=crop", title: designs?.[2]?.title, slug: designs?.[2]?.slug },
    { id: 4, type: "portrait", colSpan: "col-span-1", rowSpan: "row-span-2", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop", title: designs?.[3]?.title, slug: designs?.[3]?.slug },
    { id: 5, type: "square", colSpan: "col-span-1", rowSpan: "row-span-1", img: designs?.[4]?.preview_image_url || "https://images.unsplash.com/photo-1550614000-4b95dd2cb888?q=80&w=1000&auto=format&fit=crop", title: designs?.[4]?.title, slug: designs?.[4]?.slug },
    { id: 6, type: "landscape", colSpan: "col-span-2", rowSpan: "row-span-1", img: "https://images.unsplash.com/photo-1492447105260-2e947425b5cc?q=80&w=1000&auto=format&fit=crop", title: designs?.[5]?.title, slug: designs?.[5]?.slug },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 sm:px-12 lg:px-24 py-16">
      <div className="flex flex-col items-center text-center mb-16">
        <h1 className="font-editorial text-5xl sm:text-6xl font-bold tracking-tight text-black mb-6">
          İlham Kaynağı
        </h1>
        <p className="max-w-2xl text-lg text-gray-500 font-sans">
          Sanatın sokağa ve günlük yaşama taşındığı anlar. Topluluğumuzun tarzından ilham alın.
        </p>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
        {lookbookItems.map((item, index) => (
          <div key={index} className="break-inside-avoid">
            <Link 
              href={item.slug ? `/tasarim/${item.slug}` : "/kategori/giyim"}
              className="group relative block overflow-hidden bg-gray-100 w-full"
            >
              <img 
                src={item.img} 
                alt={item.title || "Lookbook Image"} 
                className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0 text-white font-medium tracking-widest text-sm uppercase border border-white px-6 py-3">
                  {item.title ? `Ürünü İncele` : "Stili Keşfet"}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-24 flex flex-col items-center justify-center p-12 bg-gray-50 border border-gray-100 text-center">
        <h2 className="font-editorial text-3xl font-semibold mb-4">Tarzınızı Paylaşın</h2>
        <p className="text-gray-500 mb-8 max-w-lg">
          Instagram'da bizi etiketleyin ve #SanatiGiy etiketiyle fotoğraflarınızı paylaşarak galerimizde yer alın.
        </p>
        <button className="bg-black text-white px-8 py-4 font-medium tracking-wider text-sm uppercase hover:bg-gray-900 transition-colors">
          @nonbasic.art
        </button>
      </div>
    </div>
  );
}
