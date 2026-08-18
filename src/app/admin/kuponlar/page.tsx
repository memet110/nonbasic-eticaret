import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { AdminCouponForm } from "./AdminCouponForm";

export default async function CouponsPage() {
  const supabase = await createClient();

  // Fetch all coupons
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order('created_at', { ascending: false });

  // Delete Server Action
  async function deleteCoupon(id: string) {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer.from("coupons").delete().eq("id", id);
    revalidatePath("/admin/kuponlar");
  }

  // Toggle Active Server Action
  async function toggleCoupon(id: string, currentStatus: boolean) {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer.from("coupons").update({ is_active: !currentStatus }).eq("id", id);
    revalidatePath("/admin/kuponlar");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">İndirim Kuponları</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Coupon Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Yeni Kupon Oluştur</h2>
            <AdminCouponForm />
          </div>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İndirim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limit / Kullanım</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons && coupons.length > 0 ? (
                    coupons.map((coupon: any) => (
                      <tr key={coupon.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 uppercase">
                          {coupon.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.discount_type === 'percentage' 
                            ? `%${coupon.discount_value}`
                            : `₺${coupon.discount_value}`}
                          {coupon.min_cart_amount > 0 && <span className="block text-xs text-gray-400">Min Sepet: ₺{coupon.min_cart_amount}</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.current_usage} / {coupon.max_usage || 'Limitsiz'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <form action={toggleCoupon.bind(null, coupon.id, coupon.is_active)}>
                            <button type="submit" className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {coupon.is_active ? 'Aktif' : 'Pasif'}
                            </button>
                          </form>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <form action={deleteCoupon.bind(null, coupon.id)}>
                            <button type="submit" className="text-red-600 hover:text-red-900">Sil</button>
                          </form>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        Henüz oluşturulmuş bir indirim kuponu bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
