import { createClient } from "@/utils/supabase/server";
import { NewDesignForm } from "./NewDesignForm";

export const dynamic = "force-dynamic";

export default async function NewDesignPage() {
  const supabase = await createClient();

  const { data: collections } = await supabase
    .from("collections")
    .select("id, name")
    .order("name");

  const { data: productTypes } = await supabase
    .from("product_types")
    .select("id, name, slug")
    .order("created_at");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
        <p className="text-sm text-gray-500 mt-1">Mağazanıza yeni bir tasarım ekleyin.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-6xl mx-auto">
        <NewDesignForm collections={collections || []} productTypes={productTypes || []} />
      </div>
    </div>
  );
}
