"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDesignStock(designId: string, slug: string, stock: Record<string, number>) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("designs")
    .update({ stock_inventory: stock })
    .eq("id", designId);
    
  if (error) {
    throw new Error(error.message);
  }

  // Clear Next.js cache for the specific product page so it immediately reflects the new stock
  revalidatePath(`/tasarim/${slug}`);
  // Also clear the category page just in case
  revalidatePath(`/kategori/giyim`);
  
  return { success: true };
}
