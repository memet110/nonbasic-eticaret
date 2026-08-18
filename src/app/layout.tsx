import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "NONBASIC | Sanat Tasarımlı Ürünler",
  description: "Sanat galerisi hissi veren, yüksek kaliteli ve özgün tasarımlı tişört, sweatshirt ve dekorasyon ürünleri. Sadece ürün değil, sanat satıyoruz.",
  keywords: ["sanat", "tasarım", "tişört", "sweatshirt", "premium e-ticaret", "poster", "nonbasic"],
  openGraph: {
    title: "NONBASIC | Özgün Tasarımlı Ürünler",
    description: "Sanat galerisi hissi veren, yüksek kaliteli ve özgün tasarımlı tişört, sweatshirt ve dekorasyon ürünleri.",
    type: "website",
    locale: "tr_TR",
  }
};

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { TopBanner } from "@/components/layout/TopBanner";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-brand bg-bg-primary">
        <TopBanner />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#000',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '0px',
            },
          }} 
        />
        {/* Floating Instagram Button */}
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
          title="Instagram"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16.11 7.66v.01"/>
            <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
          </svg>
        </a>
      </body>
    </html>
  );
}
