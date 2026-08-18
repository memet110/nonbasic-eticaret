export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mağaza Ayarları</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Genel Ayarlar</h2>
        </div>
        <div className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Adı</label>
            <input 
              type="text" 
              defaultValue="NONBASIC Merch"
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Kargo Ücreti (TL)</label>
            <input 
              type="number" 
              defaultValue={0}
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
            <p className="text-xs text-gray-500 mt-1">0 girilirse "Ücretsiz Kargo" olarak gösterilir.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">KDV Oranı (%)</label>
            <input 
              type="number" 
              defaultValue={20}
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-900 transition-colors">
              Ayarları Kaydet
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
