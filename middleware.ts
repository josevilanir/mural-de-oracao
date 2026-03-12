import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PRIVATE_ROUTES = ["/meus-pedidos", "/novo-pedido"];
// Routes that require ADMIN role
const ADMIN_ROUTES = ["/admin"];

export default auth((req: any) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

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
