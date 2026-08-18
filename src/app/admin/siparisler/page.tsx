import { createClient } from "@/utils/supabase/server";
import { OrderStatusUpdater } from "../OrderStatusUpdater";
import { AdminOrderReply } from "../AdminOrderReply";
import { AdminOrderReturnInfo } from "../AdminOrderReturnInfo";

export default async function OrdersPage() {
  const supabase = await createClient();

  // Fetch all orders with their items
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tüm Siparişler</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Sipariş Listesi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih / ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürünler</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders && orders.length > 0 ? (
                orders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>{new Date(order.created_at).toLocaleDateString('tr-TR')}</div>
                      <div className="text-xs text-gray-400">#{order.id.split('-')[0]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{order.customer_name}</div>
                      <div className="text-xs text-gray-400">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="mb-1">
                          <span className="font-medium text-gray-900">{item.product_name}</span>
                          <span className="text-gray-400 block text-xs">
                            {item.quantity}x {item.product_type} • {item.size}
                          </span>
                        </div>
                      ))}
                      <AdminOrderReply order={order} />
                      <AdminOrderReturnInfo order={order} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-black">
                      ₺{order.total_amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    Henüz sipariş bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
