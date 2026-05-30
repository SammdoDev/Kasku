import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/helper/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const isAuthPage =
    req.nextUrl.pathname.startsWith("/auth/login") ||
    req.nextUrl.pathname.startsWith("/auth/sign-up");

  const user = token ? await verifyToken(token) : null;

  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
