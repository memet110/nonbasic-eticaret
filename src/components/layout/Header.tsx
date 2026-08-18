"use client";
import Link from "next/link";
import { ShoppingBag, User, Search, Menu, Heart, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function Header() {
  const { items, openDrawer } = useCartStore((state) => state);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setIsLoggedIn(true);
    });

    // Fetch dynamic product types
    supabase.from('product_types').select('*').order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setProductTypes(data);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        const { data } = await supabase
          .from('designs')
          .select('id, title, slug, preview_image_url')
          .ilike('title', `%${searchQuery}%`)
          .limit(5);
        setSearchResults(data || []);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/kategori/arama?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 sm:px-12 lg:px-24">
          
          {/* Mobile Menu & Search */}
          <div className="flex flex-1 items-center gap-4 sm:hidden">
            <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 hover:text-gray-900">
              <Menu className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => { setIsSearchOpen(!isSearchOpen); setSearchQuery(""); }} className="text-gray-500 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden flex-1 items-center gap-8 sm:flex">
            <Link href="/" className="text-gray-700 hover:text-black" title="Ana Sayfa">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </Link>
            <Link href="/koleksiyonlar" className="text-sm font-medium text-gray-700 hover:text-black">
              Koleksiyonlar
            </Link>
            <Link href="/ilham" className="text-sm font-medium text-gray-700 hover:text-black">
              İlham
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black">
                Ürünler
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div className="absolute top-full left-0 pt-4 hidden group-hover:block">
                <div className="w-48 bg-white border border-gray-100 shadow-xl rounded-md flex flex-col py-2">
                  <Link href="/kategori/tumu" className="px-4 py-2 text-sm text-gray-600 font-bold hover:bg-gray-50 hover:text-black">
                    Tümünü Gör
                  </Link>
                  {productTypes.map((type) => (
                    <Link key={type.id} href={`/kategori/${type.slug}`} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black">
                      {type.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="flex flex-1 justify-center">
            <Link href="/" className="font-editorial text-2xl font-semibold tracking-tight text-black">
              NONBASIC.
            </Link>
          </div>

          {/* Actions (Desktop & Mobile) */}
          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
            <button type="button" onClick={() => { setIsSearchOpen(!isSearchOpen); setSearchQuery(""); }} className="hidden text-gray-500 hover:text-gray-900 sm:block">
              <Search className="h-5 w-5" />
            </button>
            <Link href={isLoggedIn ? "/favoriler" : "/giris"} className="hidden text-gray-500 hover:text-gray-900 sm:block">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href={isLoggedIn ? "/hesabim" : "/giris"} className="hidden text-gray-500 hover:text-gray-900 sm:block">
              <User className="h-5 w-5" />
            </Link>
            <button onClick={openDrawer} className="relative text-gray-500 hover:text-gray-900 cursor-pointer">
              <ShoppingBag className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Smart Search Dropdown (Command+K Style) */}
        {isSearchOpen && (
          <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-200 p-6 shadow-xl z-50 animate-in slide-in-from-top-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <form onSubmit={handleSearch} className="flex-1 flex items-center border-b-2 border-black pb-2">
                  <Search className="h-6 w-6 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Ne arıyorsunuz? (Örn: Yıldızlı Gece)" 
                    className="w-full text-lg outline-none font-medium text-black placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="h-8 w-8" />
                </button>
              </div>

              {/* Instant Search Results */}
              {searchQuery.trim().length > 1 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  {isSearching ? (
                    <div className="text-gray-500 text-sm py-4">Aranıyor...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tasarımlar</p>
                      {searchResults.map((result) => (
                        <Link
                          key={result.id}
                          href={`/tasarim/${result.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          <img 
                            src={result.preview_image_url} 
                            alt={result.title} 
                            className="w-12 h-12 object-cover rounded-md border border-gray-200"
                          />
                          <span className="font-medium text-gray-900 group-hover:text-black">{result.title}</span>
                        </Link>
                      ))}
                      <button 
                        onClick={handleSearch} 
                        className="mt-4 text-sm font-medium text-black border-b border-black self-start hover:text-gray-600 hover:border-gray-600 transition-colors"
                      >
                        Tüm Sonuçları Gör
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm py-4">"{searchQuery}" için sonuç bulunamadı.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sidebar Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex sm:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-white h-full flex flex-col shadow-xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="font-editorial text-xl font-bold">NONBASIC.</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex flex-col p-6 gap-6 overflow-y-auto">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-900 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Ana Sayfa
              </Link>
              <Link href="/koleksiyonlar" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-900">Koleksiyonlar</Link>
              <Link href="/ilham" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-900">İlham</Link>
              <div className="flex flex-col gap-3">
                <span className="text-lg font-medium text-gray-900">Ürünler</span>
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-gray-100">
                  <Link href="/kategori/tumu" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-gray-900">
                    Tümünü Gör
                  </Link>
                  {productTypes.map((type) => (
                    <Link key={type.id} href={`/kategori/${type.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="text-base text-gray-600">
                      {type.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <hr className="border-gray-100" />
              
              <Link href={isLoggedIn ? "/favoriler" : "/giris"} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-600">
                <Heart className="h-5 w-5" />
                <span>Favorilerim</span>
              </Link>
              <Link href={isLoggedIn ? "/hesabim" : "/giris"} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-600">
                <User className="h-5 w-5" />
                <span>{isLoggedIn ? "Hesabım" : "Giriş Yap / Üye Ol"}</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
