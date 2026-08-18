import { createClient } from "@/utils/supabase/server";

export default async function CustomersPage() {
  const supabase = await createClient();

  // Fetch unique customers from orders table
  // Since we don't have direct access to auth.users without service role,
  // we aggregate data from the orders they placed.
  const { data: orders } = await supabase
    .from("orders")
    .select("customer_name, customer_email, total_amount, created_at");

  // Group by email
  const customerMap = new Map();
  
  orders?.forEach(order => {
    if (customerMap.has(order.customer_email)) {
      const cust = customerMap.get(order.customer_email);
      cust.total_spent += Number(order.total_amount);
      cust.order_count += 1;
      if (new Date(order.created_at) > new Date(cust.last_order)) {
        cust.last_order = order.created_at;
      }
    } else {
      customerMap.set(order.customer_email, {
        name: order.customer_name,
        email: order.customer_email,
        total_spent: Number(order.total_amount),
        order_count: 1,
        last_order: order.created_at
      });
    }
  });

  const customers = Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Müşteriler</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Müşteri Listesi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsim / E-posta</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş Sayısı</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Harcama</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Son Sipariş</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((cust, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cust.name}</div>
                    <div className="text-sm text-gray-500">{cust.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {cust.order_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ₺{cust.total_spent.toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {new Date(cust.last_order).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                    Henüz kayıtlı müşteri bulunmuyor.
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
