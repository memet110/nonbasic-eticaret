"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDesign(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const slug = formData.get("slug") as string;
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

  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw) : 450.00;

  // Stock inventory initialization
  const stock_inventory = {
    "S": parseInt(formData.get("stock_S") as string) || 0,
    "M": parseInt(formData.get("stock_M") as string) || 0,
    "L": parseInt(formData.get("stock_L") as string) || 0,
    "XL": parseInt(formData.get("stock_XL") as string) || 0,
    "XXL": parseInt(formData.get("stock_XXL") as string) || 0,
  };

  const { error } = await supabase
    .from("designs")
    .update({
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
    })
    .eq("id", id);

  if (error) {
    if (error.code === '23505') {
      return { error: "Bu bağlantı (slug) adresi zaten kullanımda." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/tasarimlar");
  revalidatePath("/");
  revalidatePath("/kategori/tumu");
  revalidatePath(`/tasarim/${slug}`);
  
  return { success: true };
}
