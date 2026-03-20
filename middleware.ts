import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const PRIVATE_ROUTES = ["/meus-pedidos", "/novo-pedido", "/grupos/novo"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ONLY_PUBLIC = ["/welcome", "/login", "/register"];

const { auth } = NextAuth(authConfig);

export default auth((req: any) => {
  const { nextUrl, auth: session, method, headers } = req;
  const pathname = nextUrl.pathname;

  // CSRF Protection for mutations
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    // Exempt NextAuth routes (OAuth needs some cross-origin or special handling)
    if (!pathname.startsWith("/api/auth")) {
      const origin = headers.get("origin");
      const host = headers.get("host");
      const forwardedHost = headers.get("x-forwarded-host");
      const expectedHost = forwardedHost || host;

      if (origin) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== expectedHost) {
            console.error(
              `CSRF Origin Mismatch: Origin=${originHost}, Expected=${expectedHost}`
            );
            return new NextResponse("Invalid Origin", { status: 403 });
          }
        } catch (e) {
          return new NextResponse("Invalid Origin Format", { status: 400 });
        }
      }
    }
  }

  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthOnlyPublic = AUTH_ONLY_PUBLIC.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect authenticated users away from welcome/login/register
  if (isAuthOnlyPublic && session?.user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isPrivate && !session?.user) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  if (isAdmin) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};