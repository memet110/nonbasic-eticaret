import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { CategoryClient } from "@/components/product/CategoryClient";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const supabase = await createClient();
  
  let query = supabase.from('designs').select('*, collections(name, slug)');
  let title = "Tüm Ürünler";
  let desc = "Bu kategoride yer alan eserleri farklı formlarda taşıyın.";

  if (slug !== "tumu") {
    // Check product_types first
    const { data: pType } = await supabase
      .from('product_types')
      .select('*')
      .eq('slug', slug)
      .single();

    if (pType) {
      query = query.eq('product_type', pType.name);
      title = pType.name;
      desc = `${pType.name} tasarımlarımızı keşfedin.`;
    } else {
      // Fallback to collections
      const { data: collection } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (collection) {
        query = query.eq('collection_id', collection.id);
        title = collection.name;
        desc = collection.description || desc;
      }
    }
  }

  const { data: designs } = await query;

  if (!designs) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        Veriler yüklenemedi veya bulunamadı.
      </div>
    );
  }

  return <CategoryClient title={title} desc={desc} initialDesigns={designs} />;
}
