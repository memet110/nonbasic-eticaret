"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Image as ImageIcon, Users, Settings, Ticket, Package, Layers } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Siparişler", href: "/admin/siparisler", icon: ShoppingCart },
    { name: "Stok Yönetimi", href: "/admin/stoklar", icon: Package },
    { name: "Tasarımlar", href: "/admin/tasarimlar", icon: ImageIcon },
    { name: "Kategoriler", href: "/admin/koleksiyonlar", icon: Layers },
    { name: "Müşteriler", href: "/admin/musteriler", icon: Users },
    { name: "Kuponlar", href: "/admin/kuponlar", icon: Ticket },
    { name: "Ayarlar", href: "/admin/ayarlar", icon: Settings },
  ];

  return (
    <nav className="p-4 space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        
        return (
          <Link 
            key={link.name} 
            href={link.href} 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
