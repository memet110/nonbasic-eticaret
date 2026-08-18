"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Giriş başarısız: " + error.message);
    } else {
      alert("Başarıyla giriş yapıldı!");
      router.push("/");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] py-24">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="font-editorial text-3xl font-semibold tracking-tight text-black">
          Giriş Yap
        </h1>
        <p className="text-sm text-gray-500">
          Hesabınıza giriş yapmak için bilgilerinizi girin.
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleLogin}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none text-black">E-posta</label>
              <input
                id="email"
                placeholder="isim@ornek.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex h-12 w-full border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:border-black outline-none"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium leading-none text-black">Şifre</label>
                <Link href="/sifremi-unuttum" className="text-sm text-gray-500 hover:text-black underline">Şifremi unuttum</Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-12 w-full border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:border-black outline-none"
              />
            </div>
            <button 
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors bg-black text-white hover:bg-gray-900 h-12 px-4 py-2 mt-2 disabled:opacity-50"
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Veya devam et</span>
          </div>
        </div>
        <button 
          type="button" 
          onClick={handleGoogleLogin}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors border border-gray-300 bg-transparent hover:bg-gray-50 text-black h-12 px-4 py-2"
        >
          Google ile Giriş Yap
        </button>
      </div>
      <p className="px-8 text-center text-sm text-gray-500">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="underline underline-offset-4 hover:text-black">
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}
