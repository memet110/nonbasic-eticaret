import { createClient } from "@/utils/supabase/server";
import { CollectionForm } from "./CollectionForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCollectionsPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('name', { ascending: true });

  const { data: productTypes } = await supabase
    .from('product_types')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kategoriler & Koleksiyonlar</h1>
        <p className="text-gray-500">
          Mağazanızın ana ürün tiplerini ve koleksiyonlarını buradan yönetin.
        </p>
      </div>

      <CollectionForm 
        initialCollections={collections || []} 
        initialProductTypes={productTypes || []} 
      />
    </div>
  );
}
