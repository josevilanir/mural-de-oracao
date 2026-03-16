import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const PRIVATE_ROUTES = ["/meus-pedidos", "/novo-pedido", "/grupos/novo"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ONLY_PUBLIC = ["/welcome", "/login", "/register"];

const { auth } = NextAuth(authConfig);

export default auth((req: any) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

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
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};