"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDesign(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  let slug = formData.get("slug") as string;
  const collection_id = formData.get("collection_id") as string;
  const preview_image_url = formData.get("preview_image_url") as string;
  const product_type = formData.get("product_type") as string;
  const gallery_images_raw = formData.get("gallery_images") as string;
  const main_image_position_raw = formData.get("main_image_position") as string;
  
  let gallery_images: string[] = [];
  try {
    if (gallery_images_raw) gallery_images = JSON.parse(gallery_images_raw);
  } catch (e) {}

  let main_image_position = { x: 50, y: 50 };
  try {
    if (main_image_position_raw) main_image_position = JSON.parse(main_image_position_raw);
  } catch (e) {}

  // Auto-generate slug if empty
  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Stock inventory initialization
  const stock_inventory = {
    "S": parseInt(formData.get("stock_S") as string) || 0,
    "M": parseInt(formData.get("stock_M") as string) || 0,
    "L": parseInt(formData.get("stock_L") as string) || 0,
    "XL": parseInt(formData.get("stock_XL") as string) || 0,
    "XXL": parseInt(formData.get("stock_XXL") as string) || 0,
  };

  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw) : 450.00;

  const { error } = await supabase
    .from("designs")
    .insert({
      title,
      description,
      slug,
      price,
      collection_id: collection_id || null,
      preview_image_url,
      gallery_images,
      main_image_position,
      stock_inventory,
      product_type
    });

  if (error) {
    // If slug constraint fails
    if (error.code === '23505') {
      return { error: "Bu bağlantı (slug) adresi veya başlık zaten kullanımda. Lütfen değiştirin." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/tasarimlar");
  revalidatePath("/admin/stoklar");
  revalidatePath("/kategori/giyim");
  
  return { success: true };
}

export async function createCollection(name: string) {
  const supabase = await createClient();
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  
  const { data, error } = await supabase
    .from("collections")
    .insert({ name, slug })
    .select()
    .single();
    
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/tasarimlar/yeni");
  revalidatePath("/admin/koleksiyonlar");
  revalidatePath("/koleksiyonlar");
  return { success: true, collection: data };
}

export async function createProductType(name: string) {
  const supabase = await createClient();
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  
  const { data, error } = await supabase
    .from("product_types")
    .insert({ name, slug })
    .select()
    .single();
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/admin/tasarimlar/yeni");
  return { success: true, productType: data };
}
