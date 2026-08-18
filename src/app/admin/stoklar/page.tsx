import { createClient } from "@/utils/supabase/server";
import { AdminStockEditor } from "./AdminStockEditor";
import { AdminFilter } from "../tasarimlar/AdminFilter";

export const dynamic = "force-dynamic";

export default async function AdminStocksPage({
  searchParams
}: {
  searchParams: { search?: string; category?: string }
}) {
  const { search, category } = await searchParams;
  const supabase = await createClient();
  
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("designs")
    .select("id, title, slug, preview_image_url, stock_inventory")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (category) {
    query = query.eq('collection_id', category);
  }

  const { data: designs } = await query;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Stok Yönetimi</h1>
      </div>

      <div className="mb-6">
        <AdminFilter collections={collections || []} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tüm Ürünlerin Stokları</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {designs && designs.length > 0 ? (
            designs.map((design) => (
              <AdminStockEditor key={design.id} design={design} />
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 text-sm">
              Sistemde kriterlere uygun ürün bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
