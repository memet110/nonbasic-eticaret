"use client";

import { useState, useRef } from "react";

export function ImageZoom({ src, alt }: { src: string; alt: string }) {
  const [zoomParams, setZoomParams] = useState({ x: 0, y: 0, isZoomed: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - left) / width) * 100;
    const y = ((clientY - top) / height) * 100;

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setZoomParams({ x: clampedX, y: clampedY, isZoomed: true });
  };

  const handleMouseLeave = () => {
    setZoomParams((prev) => ({ ...prev, isZoomed: false }));
  };

  return (
    <div 
      ref={containerRef}
      className="aspect-[4/5] w-full overflow-hidden bg-gray-100 relative cursor-crosshair group touch-pan-y"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseLeave}
    >
      <img 
        src={src} 
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${zoomParams.isZoomed ? 'opacity-0' : 'opacity-100'}`}
      />
      <div 
        className={`absolute inset-0 bg-no-repeat transition-opacity duration-300 ease-out pointer-events-none ${zoomParams.isZoomed ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url('${src}')`,
          backgroundPosition: `${zoomParams.x}% ${zoomParams.y}%`,
          backgroundSize: '200%', // The zoom level (2x)
        }}
      />
    </div>
  );
}
