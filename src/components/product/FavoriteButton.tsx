"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function FavoriteButton({ designId }: { designId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    checkFavorite();
  }, [designId]);

  const checkFavorite = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('design_id', designId)
        .single();
        
      setIsFavorite(!!data);
    }
    setLoading(false);
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert("Favorilere eklemek için giriş yapmalısınız.");
      return;
    }

    if (isFavorite) {
      setIsFavorite(false);
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('design_id', designId);
        
      if (error) {
        setIsFavorite(true);
        console.error("Favori silinirken hata:", error);
      }
    } else {
      setIsFavorite(true);
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          design_id: designId
        });
        
      if (error) {
        setIsFavorite(false);
        console.error("Favori eklenirken hata:", error);
        alert("Favorilere eklenirken bir hata oluştu. Veritabanı tablolarının oluşturulduğundan emin misiniz? (Hata: " + error.message + ")");
      }
    }
  };

  if (loading) {
    return <div className="h-6 w-6 animate-pulse bg-gray-200 rounded-full"></div>;
  }

  return (
    <button 
      onClick={toggleFavorite}
      className={`transition-colors hover:scale-110 ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-black'}`}
      aria-label="Favorilere Ekle"
    >
      <Heart className="h-6 w-6" fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}
