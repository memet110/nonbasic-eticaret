import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";
import { Package, User as UserIcon, Heart, Settings } from "lucide-react";
import { AddressManager } from "@/components/profile/AddressManager";
import { ProfileManager } from "@/components/profile/ProfileManager";
import { OrderQuestionButton } from "@/components/profile/OrderQuestionButton";
import { OrderReturnButton } from "@/components/profile/OrderReturnButton";
import { CustomerReturnStatus } from "@/components/profile/CustomerReturnStatus";
import { ProductReviewButton } from "@/components/profile/ProductReviewButton";

export default async function AccountPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = await createClient();
  const { tab = "siparisler" } = await searchParams;
  
  // Get current logged in user
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect("/giris");
  }

  // Fetch orders matching this user's email
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .or(`customer_email.eq.${user.email},user_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Fetch favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      id,
      designs (
        id,
        title,
        slug,
        preview_image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch user's reviews to hide "Değerlendir" button if already reviewed
  const { data: userReviews } = await supabase
    .from("product_reviews")
    .select("product_slug")
    .eq("user_id", user.id);

  const reviewedSlugs = new Set(userReviews?.map(r => r.product_slug) || []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="mb-8">
            <h2 className="text-xl font-editorial font-bold text-black mb-1">{user.user_metadata?.full_name || "Hesabım"}</h2>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link href="/hesabim?tab=siparisler" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${tab === 'siparisler' ? 'bg-stone-100 text-black' : 'text-gray-600 hover:bg-stone-50 hover:text-black'}`}>
              <Package className="h-4 w-4" />
              Siparişlerim
            </Link>
            <Link href="/hesabim?tab=profil" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${tab === 'profil' ? 'bg-stone-100 text-black' : 'text-gray-600 hover:bg-stone-50 hover:text-black'}`}>
              <UserIcon className="h-4 w-4" />
              Profil Bilgileri
            </Link>
            <Link href="/hesabim?tab=adresler" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${tab === 'adresler' ? 'bg-stone-100 text-black' : 'text-gray-600 hover:bg-stone-50 hover:text-black'}`}>
              <Settings className="h-4 w-4" />
              Kayıtlı Adreslerim
            </Link>
            <Link href="/hesabim?tab=favoriler" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${tab === 'favoriler' ? 'bg-stone-100 text-black' : 'text-gray-600 hover:bg-stone-50 hover:text-black'}`}>
              <Heart className="h-4 w-4" />
              Favorilerim
            </Link>
            <div className="mt-8 px-4">
              <LogoutButton />
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {tab === "siparisler" && (
            <>
              <h3 className="text-2xl font-editorial font-semibold tracking-tight text-black mb-8">
                Son Siparişlerim
              </h3>

              {orders && orders.length > 0 ? (
                <div className="space-y-8">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-stone-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Sipariş Tarihi</p>
                          <p className="text-sm font-medium text-black mt-1">
                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Tutar</p>
                          <p className="text-sm font-medium text-black mt-1">₺{order.total_amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Sipariş No</p>
                          <p className="text-sm font-medium text-black mt-1">#{order.id.split('-')[0]}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-black text-white">
                            {order.status}
                          </span>
                          <OrderReturnButton order={order} />
                        </div>
                      </div>
                      
                      <div className="px-6 py-6 divide-y divide-gray-100 relative">
                        {order.order_items?.map((item: any, index: number) => (
                          <div key={item.id} className="flex flex-col lg:flex-row gap-6 py-4 first:pt-0 last:pb-0 justify-between">
                            <div className="flex gap-6 flex-1">
                              {item.product_slug ? (
                                <Link href={`/tasarim/${item.product_slug}`} className="h-24 w-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden hover:opacity-80 transition-opacity">
                                  <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                                </Link>
                              ) : (
                                <div className="h-24 w-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                  <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                                </div>
                              )}
                              <div className="flex flex-col justify-center">
                                {item.product_slug ? (
                                  <Link href={`/tasarim/${item.product_slug}`} className="hover:underline decoration-1 underline-offset-4">
                                    <h4 className="text-base font-medium text-black">{item.product_name}</h4>
                                  </Link>
                                ) : (
                                  <h4 className="text-base font-medium text-black">{item.product_name}</h4>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                  {item.product_type} • Beden: {item.size} • Adet: {item.quantity}
                                </p>
                                <p className="text-sm font-medium text-black mt-2">₺{item.unit_price}</p>
                                <ProductReviewButton 
                                  item={item} 
                                  orderStatus={order.status} 
                                  userName={user.user_metadata?.full_name || user.email?.split('@')[0] || "İsimsiz"} 
                                  hasReviewedInitially={item.product_slug ? reviewedSlugs.has(item.product_slug) : false}
                                />
                              </div>
                            </div>
                            
                            {/* İade Bilgisini ilk ürünün hemen yanına koyuyoruz */}
                            {index === 0 && order.return_request && (order.status === "İade Kabul Edildi" || order.status === "İade Reddedildi") && (
                              <div className="w-full lg:w-80 flex-shrink-0">
                                <CustomerReturnStatus order={order} />
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <OrderQuestionButton order={order} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-stone-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-500 mb-6">Henüz bir siparişiniz bulunmuyor.</p>
                  <Link href="/kategori/giyim" className="inline-flex items-center justify-center bg-black text-white px-8 py-3 uppercase text-sm font-medium tracking-wider hover:bg-gray-900 transition-colors">
                    Alışverişe Başla
                  </Link>
                </div>
              )}
            </>
          )}

          {tab === "profil" && (
            <>
              <h3 className="text-2xl font-editorial font-semibold tracking-tight text-black mb-8">
                Profil Bilgileri
              </h3>
              <ProfileManager user={user} />
            </>
          )}

          {tab === "adresler" && (
            <>
              <h3 className="text-2xl font-editorial font-semibold tracking-tight text-black mb-8">
                Kayıtlı Adreslerim
              </h3>
              <AddressManager />
            </>
          )}

          {tab === "favoriler" && (
            <>
              <h3 className="text-2xl font-editorial font-semibold tracking-tight text-black mb-8">
                Favorilerim
              </h3>
              {favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((fav: any) => {
                    const design = Array.isArray(fav.designs) ? fav.designs[0] : fav.designs;
                    if (!design) return null;
                    return (
                      <Link 
                        key={fav.id} 
                        href={`/tasarim/${design.slug}`}
                        className="group flex flex-col"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                          <img 
                            src={design.preview_image_url} 
                            alt={design.title} 
                            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                          />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-100 shadow-sm">
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium text-black group-hover:underline decoration-1 underline-offset-4">
                          {design.title}
                        </h3>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-stone-50 border border-gray-200 rounded-lg">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-6">Henüz hiç favori tasarımınız bulunmuyor.</p>
                  <Link href="/kategori/giyim" className="inline-flex items-center justify-center bg-black text-white px-8 py-3 uppercase text-sm font-medium tracking-wider hover:bg-gray-900 transition-colors">
                    Tasarımları Keşfet
                  </Link>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
