"use client";

import Link from "next/link";
import { ArrowRight, Eye, X } from "lucide-react";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ImageZoom } from "@/components/product/ImageZoom";

export function DesignCard({ design }: { design: any }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col">
        <div className="relative">
          <Link href={`/tasarim/${design.slug}`} className="block overflow-hidden bg-gray-200 relative aspect-[3/4]">
            <img 
              src={design.preview_image_url} 
              alt={design.title} 
              style={{ objectPosition: design.main_image_position ? `${design.main_image_position.x}% ${design.main_image_position.y}%` : '50% 50%' }}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </Link>
          
          {/* Quick View Trigger - Visible on mobile, hover on desktop */}
          <button 
            onClick={(e) => { e.preventDefault(); setIsQuickViewOpen(true); }}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-black p-3 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-20"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>

        {/* Info below image */}
        <div className="mt-4 flex flex-col items-center text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{design.product_type || "Tasarım"}</p>
          <Link href={`/tasarim/${design.slug}`} className="font-editorial text-xl font-medium text-black hover:text-gray-600 transition-colors">
            {design.title}
          </Link>
          <p className="mt-2 text-sm font-semibold text-gray-900">₺{design.price || 450},00</p>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsQuickViewOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] flex flex-col sm:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95">
            <button 
              onClick={() => setIsQuickViewOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black z-10 bg-white/50 p-1 rounded-full backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="w-full sm:w-1/2 bg-gray-100 relative flex items-center justify-center">
              <ImageZoom src={design.preview_image_url} alt={design.title} />
            </div>
            
            <div className="w-full sm:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white overflow-y-auto">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">{design.collections?.name}</span>
              
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-editorial text-4xl font-bold">{design.title}</h2>
                <FavoriteButton designId={design.id} />
              </div>
              <p className="text-xl font-medium text-black mb-4">₺{design.price || 450},00</p>
              
              <p className="text-gray-500 mb-6">{design.description}</p>
              
              <div className="mb-6 -mt-4">
                <AddToCartButton 
                  slug={design.slug} 
                  name={design.title} 
                  price={design.price || 450} 
                  image={design.preview_image_url} 
                />
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <Link 
                  href={`/tasarim/${design.slug}`}
                  className="flex items-center justify-center w-full border border-gray-300 text-black py-4 font-medium tracking-wider text-sm uppercase hover:bg-gray-50 transition-colors"
                >
                  Tüm Detayları Gör
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
