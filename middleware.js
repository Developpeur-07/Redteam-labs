import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Indique si le profil a un objectif renseigné.
 * @param {{ objectif?: string | null } | null} profile
 * @returns {boolean}
 */
function hasObjectif(profile) {
  return Boolean(profile?.objectif && String(profile.objectif).trim());
}

/**
 * Middleware Next.js pour rafraîchir la session Supabase et protéger les routes.
 * Critère Phase 1 : utilisateur connecté sans objectif → /onboarding.
 * @param {import('next/server').NextRequest} request
 */
export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-project')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes Phase 1 (+ futures routes dashboard protégées)
  const protectedRoutes = ['/profile', '/onboarding', '/roadmap', '/progression', '/notes'];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  const authRoutes = ['/login', '/register'];
  const isAuthPage = authRoutes.includes(pathname);
  const isOnboarding = pathname.startsWith('/onboarding');

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && (isProtected || isAuthPage)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('objectif')
      .eq('user_id', user.id)
      .maybeSingle();

    const objectifOk = hasObjectif(profile);

    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = objectifOk ? '/profile' : '/onboarding';
      return NextResponse.redirect(url);
    }

    if (!objectifOk && !isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    if (objectifOk && isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/profile';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
