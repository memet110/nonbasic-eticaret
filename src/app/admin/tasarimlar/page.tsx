import { createClient } from "@/utils/supabase/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DesignListCard } from "./DesignListCard";
import { AdminFilter } from "./AdminFilter";

export const dynamic = "force-dynamic";

export default async function DesignsPage({
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
    .select(`
      *,
      collections (id, name)
    `)
    .order('created_at', { ascending: false });

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
        <h1 className="text-2xl font-bold text-gray-900">Tasarımlar</h1>
        <Link href="/admin/tasarimlar/yeni" className="bg-black text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-900 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Tasarım Ekle
        </Link>
      </div>

      <div className="mb-6">
        <AdminFilter collections={collections || []} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {designs?.map((design) => (
          <DesignListCard key={design.id} design={design} />
        ))}
        {designs?.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
            Kriterlere uygun tasarım bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
