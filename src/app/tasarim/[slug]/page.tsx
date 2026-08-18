import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { DesignCard } from "@/components/product/DesignCard";
import { StickyCartBar } from "@/components/product/StickyCartBar";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const supabase = await createClient();
  const { data: design } = await supabase
    .from('designs')
    .select('*, collections(name)')
    .eq('slug', slug)
    .single();

  if (!design) {
    notFound();
  }

  const productName = design.title;
  const productPrice = design.price || 450;
  const productImage = design.preview_image_url;
  const galleryImages = design.gallery_images || [];
  const mainImagePos = design.main_image_position || { x: 50, y: 50 };

  // Fetch related designs (excluding current one)
  const { data: relatedDesigns } = await supabase
    .from('designs')
    .select('*, collections(name)')
    .neq('id', design.id)
    .limit(3);

  // Fetch reviews for this product
  const { data: reviewsData } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_slug', slug)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
    
  const reviews = reviewsData || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/koleksiyonlar" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8">
        <ArrowLeft className="h-4 w-4" />
        Koleksiyonlara Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Gallery */}
        <div className="w-full">
          <ProductGallery 
            mainImage={productImage} 
            galleryImages={galleryImages} 
            mainImagePos={mainImagePos}
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col pt-8">
          <div className="flex items-start justify-between">
            <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-black capitalize">
              {productName}
            </h1>
            <div className="pt-2">
              <FavoriteButton designId={design.id} />
            </div>
          </div>
          <p className="mt-2 text-lg text-gray-500">Koleksiyon: {design.collections?.name}</p>
          <p className="mt-8 text-2xl font-medium text-black">₺{productPrice},00</p>
          
          <AddToCartButton 
            slug={design.slug} 
            name={productName} 
            price={productPrice} 
            image={productImage}
            stockInventory={design.stock_inventory}
          />
          
          <div className="mt-12 space-y-6 text-sm text-gray-500">
            <p>
              {design.description}
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Premium kalın koton kumaş, %100 Organik Pamuk</li>
              <li>Sipariş üzerine özel baskı</li>
              <li>Türkiye içi ücretsiz kargo</li>
            </ul>
          </div>
          
          {/* Reviews Section (Real Data) */}
          <div className="mt-16 border-t border-gray-200 pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h3 className="font-editorial text-2xl font-semibold text-black">Müşteri Yorumları</h3>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {"★★★★★".split("").map((_, i) => (
                    <span key={i} className={i < averageRating ? "text-yellow-400" : "text-gray-200"}>★</span>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {reviews.length > 0 ? `${averageRating.toFixed(1)} (${reviews.length} Değerlendirme)` : "Henüz değerlendirme yok"}
                </span>
              </div>
            </div>
            
            <div className="space-y-8">
              {reviews.length > 0 ? reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-black">{review.user_name}</span>
                    <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex text-yellow-400 text-sm mb-3">
                    {Array(5).fill(0).map((_, j) => (
                      <span key={j} className={j < review.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap">{review.comment}</p>
                  )}
                </div>
              )) : (
                <div className="bg-stone-50 rounded-lg p-8 text-center text-gray-500 text-sm">
                  Bu ürün için henüz değerlendirme yapılmamış. İlk değerlendiren siz olun!
                </div>
              )}
            </div>
            {reviews.length > 3 && (
              <button className="mt-8 w-full border border-black text-black py-4 font-medium tracking-wider text-sm uppercase hover:bg-gray-50 transition-colors">
                Tüm Yorumları Gör
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cross-Selling (Related Products) */}
      {relatedDesigns && relatedDesigns.length > 0 && (
        <div className="mt-32 pt-16 border-t border-gray-200">
          <div className="flex flex-col items-center mb-12 text-center">
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-black">
              Bunlar da Hoşuna Gidebilir
            </h2>
            <p className="mt-4 text-gray-500 font-sans">
              Koleksiyonun öne çıkan diğer eşsiz tasarımları.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedDesigns.map((relatedDesign) => (
              <DesignCard key={relatedDesign.id} design={relatedDesign} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Cart Bar */}
      <StickyCartBar 
        slug={design.slug}
        name={productName}
        price={productPrice}
        image={productImage}
        stockInventory={design.stock_inventory}
      />
    </div>
  );
}
