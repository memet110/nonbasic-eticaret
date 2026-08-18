import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { EditDesignForm } from "./EditDesignForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditDesignPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  const query = supabase.from("designs").select("*");
  if (isUuid) {
    query.or(`slug.eq.${slug},id.eq.${slug}`);
  } else {
    query.eq("slug", slug);
  }

  const { data: design } = await query.single();

  if (!design) return notFound();

  const { data: collections } = await supabase.from("collections").select("*").order("name");
  const { data: productTypes } = await supabase.from("product_types").select("*").order("name");

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/tasarimlar" className="text-gray-500 hover:text-black flex items-center gap-2 text-sm font-medium w-fit mb-4">
          <ArrowLeft className="w-4 h-4" />
          Tasarımlara Dön
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tasarımı Düzenle: {design.title}</h1>
      </div>
      
      <EditDesignForm 
        design={design}
        collections={collections || []}
        productTypes={productTypes || []}
      />
    </div>
  );
}
