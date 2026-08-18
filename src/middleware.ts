import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  // Sadece /admin ile başlayan yolları koru (api yolları hariç)
  if (url.pathname.startsWith('/admin')) {
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // ÇEVRE DEĞİŞKENLERİNDEN (Vercel) ŞİFREYİ ÇEKİYORUZ
      const expectedUser = process.env.ADMIN_USERNAME || 'admin';
      const expectedPwd = process.env.ADMIN_PASSWORD || 'nonbasic2026';

      if (user === expectedUser && pwd === expectedPwd) {
        return NextResponse.next();
      }
    }

    // GİZLİLİK MODU (Stealth Mode):
    // Sadece /admin?patron=burada yazanlara şifre ekranını göster
    if (url.searchParams.get('patron') === 'burada') {
      return new NextResponse('Yetkisiz Giris', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Yonetici Paneli"',
        },
      });
    }

    // Normal bir kullanıcı /admin yazarsa direkt 404 (Bulunamadı) sayfasına gönder
    // Böylece burada bir admin paneli olduğunu asla bilemezler.
    url.pathname = '/404-bulunamadi';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
