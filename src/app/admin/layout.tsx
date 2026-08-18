import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/admin" className="font-editorial text-xl font-bold tracking-tight">
            NONBASIC Admin
          </Link>
        </div>
        <AdminNav />
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 md:hidden">
          <h1 className="font-editorial font-bold">NONBASIC Admin</h1>
        </header>
        <div className="p-6 sm:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
