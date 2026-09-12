import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleHome: Record<string, string> = {
  admin: "/admin",
  courier: "/courier",
  customer: "/dashboard",
};

function areaFor(pathname: string): "admin" | "courier" | "customer" | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/courier")) return "courier";
  if (pathname.startsWith("/dashboard")) return "customer";
  return null;
}

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.user?.role;
    const area = areaFor(req.nextUrl.pathname);

    if (area && role !== area) {
      const target = (role && roleHome[role]) || "/";
      return NextResponse.redirect(new URL(target, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/sign-in",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/courier/:path*", "/dashboard/:path*"],
};
