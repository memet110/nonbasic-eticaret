"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend
} from 'recharts';

const COLORS = ['#000000', '#4B5563', '#9CA3AF', '#D1D5DB', '#F3F4F6'];
const STATUS_COLORS: Record<string, string> = {
  'Baskı Bekleyen': '#F59E0B',
  'Kargolandı': '#3B82F6',
  'Teslim Edildi': '#10B981',
  'İade Edildi': '#EF4444',
  'Ödeme Bekleniyor': '#9CA3AF'
};

export function DashboardCharts({ 
  salesData, 
  statusData 
}: { 
  salesData: any[],
  statusData: any[] 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      
      {/* Sales Line Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">Son 7 Günlük Ciro (₺)</h3>
        <div className="h-64">
          {salesData && salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `₺${value}`}
                />
                <LineTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₺${value}`, 'Ciro']}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#000000" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#000000', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#000000' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Yeterli veri yok
            </div>
          )}
        </div>
      </div>

      {/* Order Status Pie Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">Sipariş Durumu Dağılımı</h3>
        <div className="h-64">
          {statusData && statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <PieTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Yeterli veri yok
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
