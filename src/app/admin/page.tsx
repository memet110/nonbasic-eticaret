import { Download } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { OrderStatusUpdater } from "./OrderStatusUpdater";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

type OrderItem = {
  id: string;
  product_name: string;
  product_type: string;
  size: string;
  quantity: number;
};

type Order = {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all orders to compute dashboard stats
  const { data: allOrders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  const orders = allOrders || [];
  
  // Calculate top-level stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Baskı Bekleyen').length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  // Recent 5 orders for the table
  const recentOrders = orders.slice(0, 5);

  // --- Prepare Data for Charts ---
  
  // 1. Status Distribution
  const statusCounts = orders.reduce((acc: any, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  const statusData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  // 2. Daily Sales for the last 7 days
  const salesByDate: Record<string, number> = {};
  
  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    salesByDate[dateStr] = 0;
  }

  // Populate actual sales
  orders.forEach(order => {
    // Only count paid or completed orders in real life, but we'll count all here
    const d = new Date(order.created_at);
    const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    
    // If order is within our 7-day window
    if (salesByDate[dateStr] !== undefined) {
      salesByDate[dateStr] += Number(order.total_amount);
    }
  });

  const salesData = Object.keys(salesByDate).map(date => ({
    date,
    total: salesByDate[date]
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Yönetici Paneli</h1>
      </div>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Bekleyen İşler</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{pendingOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Toplam Sipariş</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Toplam Ciro</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">₺{totalRevenue.toLocaleString("tr-TR")}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts salesData={salesData} statusData={statusData} />

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Son Siparişler</h2>
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
              {recentOrders.length > 0 ? (
                recentOrders.map((order: Order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>{new Date(order.created_at).toLocaleDateString('tr-TR')}</div>
                      <div className="text-xs text-gray-400">#{order.id.split('-')[0]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.order_items?.map((item, idx) => (
                        <div key={item.id} className="mb-1">
                          <span className="font-medium text-gray-900">{item.product_name}</span>
                          <span className="text-gray-400 block text-xs">
                            {item.quantity}x {item.product_type} • {item.size}
                          </span>
                        </div>
                      ))}
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
