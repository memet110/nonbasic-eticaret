import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Hikayeler ve Sanat | NONBASIC",
  description: "Tasarım süreçlerimiz, sanat akımları ve yaratıcı hikayeler. NONBASIC günlüğünü keşfedin.",
};

// Static mock data for MVP
const posts = [
  {
    id: 1,
    title: "Okyanus Koleksiyonunun Doğuşu",
    excerpt: "Mavinin farklı tonlarını ararken stüdyoda geçirdiğimiz 48 saatlik maratonun hikayesi ve dalgaların anatomisi üzerine düşünceler.",
    date: "12 Ekim 2026",
    category: "Sahne Arkası",
    image: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Neden Sadece 2 Font Kullanıyoruz?",
    excerpt: "Sadeleşmenin getirdiği karmaşıklık. Tasarımlarımızda görsel bir karmaşa yaratmamak için benimsediğimiz minimal tipografi prensipleri.",
    date: "05 Eylül 2026",
    category: "Tasarım Felsefesi",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Şehir Ruhu: Sokak Sanatından E-Ticarete",
    excerpt: "Grafiti dokularını dijital vektörlere dönüştürme sürecimiz ve 'Şehir Ruhu' koleksiyonunda kullandığımız teknikler.",
    date: "22 Ağustos 2026",
    category: "Teknik Süreç",
    image: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2000&auto=format&fit=crop"
  }
];

export default function BlogPage() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-24">
        
        <div className="mb-20">
          <h1 className="font-editorial text-5xl md:text-6xl font-bold tracking-tight text-black mb-6">
            Hikayeler
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Tasarım süreçlerimiz, sanat akımları ve yaratıcı günlüğümüz. 
            Burada ürün satmıyoruz; hikayemizi paylaşıyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map((post) => (
            <article key={post.id} className="group flex flex-col cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-6">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                <span>{post.category}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{post.date}</span>
              </div>
              <h2 className="text-2xl font-editorial font-bold text-black mb-3 group-hover:underline decoration-1 underline-offset-4">
                {post.title}
              </h2>
              <p className="text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-black">
                Devamını Oku
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
