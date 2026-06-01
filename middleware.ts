import { NextRequest, NextResponse } from "next/server";

// Auth guard ditangani sepenuhnya oleh AppShell (client-side)
// karena token disimpan di sessionStorage, tidak bisa dibaca server-side
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
