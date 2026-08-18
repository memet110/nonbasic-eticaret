"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCollection(name: string) {
  const supabase = await createClient();
  const slug = name
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const { data, error } = await supabase
    .from("collections")
    .insert({ name, slug })
    .select()
    .single();
    
  if (error) {
    if (error.code === '23505') {
      return { error: "Bu isimde bir koleksiyon zaten mevcut." };
    }
    return { error: error.message };
  }
  revalidatePath("/admin/koleksiyonlar");
  revalidatePath("/koleksiyonlar");
  return { success: true, collection: data };
}

export async function updateCollectionCover(id: string, cover_image_url: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("collections")
    .update({ cover_image_url })
    .eq('id', id);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/admin/koleksiyonlar");
  revalidatePath("/koleksiyonlar");
  return { success: true };
}

export async function deleteCollection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) return { error: error.message };
  
  revalidatePath("/admin/koleksiyonlar");
  revalidatePath("/koleksiyonlar");
  return { success: true };
}

export async function createProductType(name: string) {
  const supabase = await createClient();
  const slug = name
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const { data, error } = await supabase
    .from("product_types")
    .insert({ name, slug })
    .select()
    .single();
    
  if (error) {
    if (error.code === '23505') return { error: "Bu isimde bir ürün tipi zaten mevcut." };
    return { error: error.message };
  }
  
  revalidatePath("/admin/koleksiyonlar");
  return { success: true, productType: data };
}

export async function deleteProductType(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_types").delete().eq("id", id);
  if (error) return { error: error.message };
  
  revalidatePath("/admin/koleksiyonlar");
  return { success: true };
}
