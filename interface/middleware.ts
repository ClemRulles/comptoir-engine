import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session cookie and protects app routes.
// Public: /login, /api/cron/* et /api/memory/* (protégés par leur propre CRON_SECRET).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  let refreshed = false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // If Supabase isn't configured yet, don't block (lets the app boot for setup).
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        refreshed = true;
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    path.startsWith("/login") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/api/cron") ||
    path.startsWith("/api/memory") ||
    path.startsWith("/auth");

  if (!user && !isPublic) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    return NextResponse.redirect(redirect);
  }

  // Rester connecté : la connexion se fait dans le navigateur, qui écrit le cookie de session
  // en JavaScript — et Safari (iPhone) efface ces cookies-là au bout de 7 jours. On le réécrit
  // donc côté serveur à chaque ouverture de page (400 jours, la durée maximale), sauf si
  // Supabase vient de le renouveler lui-même dans cette requête.
  if (user && !refreshed && request.method === "GET" && (request.headers.get("accept") ?? "").includes("text/html")) {
    const secure = request.nextUrl.protocol === "https:";
    for (const c of request.cookies.getAll()) {
      if (!c.name.startsWith("sb-") || !c.name.includes("-auth-token") || c.name.endsWith("code-verifier")) continue;
      response.cookies.set(c.name, c.value, { path: "/", maxAge: 400 * 24 * 60 * 60, sameSite: "lax", secure, httpOnly: false });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
