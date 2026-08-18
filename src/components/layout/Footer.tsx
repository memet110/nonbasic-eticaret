import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Newsletter */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="font-editorial text-2xl font-semibold tracking-tight text-white mb-6 inline-block">
              NONBASIC.
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
              Sıradanlığı Reddet. Yeni eserler, gizli koleksiyonlar ve özel indirimlerden ilk senin haberin olsun.
            </p>
            <form className="flex border-b border-gray-700 pb-2 max-w-md group focus-within:border-white transition-colors">
              <input 
                type="email" 
                placeholder="E-posta adresin" 
                className="bg-transparent text-sm text-white w-full outline-none placeholder-gray-500"
              />
              <button type="button" className="text-sm font-medium text-white tracking-wider uppercase opacity-50 hover:opacity-100 transition-opacity">
                Katıl
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white">Alışveriş</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/kategori/tisort" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Tişört
                </Link>
              </li>
              <li>
                <Link href="/kategori/sweatshirt" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Sweatshirt
                </Link>
              </li>
              <li>
                <Link href="/kategori/mug" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Mug & Fincan
                </Link>
              </li>
              <li>
                <Link href="/kategori/poster" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Poster & Dekorasyon
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white">Kurumsal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/sayfa/hakkimizda" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/sayfa/sss" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/sayfa/kargo" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Kargo & Teslimat
                </Link>
              </li>
              <li>
                <Link href="/sayfa/iade" className="text-sm text-gray-400 hover:text-white transition-colors">
                  İade ve Değişim
                </Link>
              </li>
              <li>
                <Link href="/sayfa/iletisim" className="text-sm text-gray-400 hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between border-t border-gray-200 pt-8 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} NONBASIC. Tüm hakları saklıdır.
          </p>
          <div className="mt-4 flex space-x-4 sm:mt-0">
            <Link href="/sayfa/mesafeli-satis" className="text-xs text-gray-500 hover:text-black">
              Mesafeli Satış Sözleşmesi
            </Link>
            <Link href="/sayfa/kvkk" className="text-xs text-gray-500 hover:text-black">
              KVKK Aydınlatma Metni
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
