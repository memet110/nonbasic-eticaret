"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteDesign(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("designs").delete().eq("id", id);
  if (error) return { error: error.message };
  
  revalidatePath("/admin/tasarimlar");
  revalidatePath("/");
  revalidatePath("/kategori/tumu");
  return { success: true };
}

export async function updateDesignPrice(id: string, price: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("designs").update({ price }).eq("id", id);
  if (error) return { error: error.message };
  
  revalidatePath("/admin/tasarimlar");
  revalidatePath("/");
  revalidatePath("/kategori/tumu");
  return { success: true };
}
