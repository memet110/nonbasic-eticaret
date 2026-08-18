"use client";
import { useState } from "react";
import { ImageZoom } from "./ImageZoom";

export function ProductGallery({ 
  mainImage, 
  galleryImages, 
  mainImagePos 
}: { 
  mainImage: string; 
  galleryImages: string[];
  mainImagePos?: { x: number; y: number };
}) {
  const allImages = [mainImage, ...galleryImages].filter(Boolean);
  const [activeIdx, setActiveIdx] = useState(0);
  
  const activeImage = allImages[activeIdx];
  const isMainActive = activeIdx === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Active Image */}
      <div 
        className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden relative cursor-crosshair group"
      >
        <img
          src={activeImage}
          alt="Product Image"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ 
            objectPosition: isMainActive && mainImagePos ? `${mainImagePos.x}% ${mainImagePos.y}%` : '50% 50%' 
          }}
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {allImages.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveIdx(idx)}
              className={`aspect-[4/5] bg-gray-100 rounded-md overflow-hidden border-2 transition-all ${activeIdx === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img 
                src={img} 
                alt="Thumbnail"
                className="w-full h-full object-cover pointer-events-none"
                style={{ 
                  objectPosition: (idx === 0 && mainImagePos) ? `${mainImagePos.x}% ${mainImagePos.y}%` : '50% 50%' 
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
