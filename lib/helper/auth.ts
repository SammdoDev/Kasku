// src/lib/middleware/auth.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "@/lib/helper/jwt";

export type AuthedRequest = NextRequest & { user: JWTPayload };

// Tipe params yang kompatibel dengan Next.js App Router
// Record<string, string> supaya { id: string } bisa di-assign ke sini
export type RouteContext = { params: Record<string, string> };

/**
 * Wraps a route handler dengan JWT auth.
 * Token bisa dari cookie "token" ATAU header Authorization: Bearer.
 */
export function withAuth(
  handler: (req: AuthedRequest, ctx: RouteContext) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: RouteContext) => {
    try {
      let token = req.cookies.get("token")?.value;

      if (!token) {
        const authHeader = req.headers.get("authorization") ?? "";
        if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7);
      }

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const user = await verifyToken(token);
      (req as AuthedRequest).user = user;

      return handler(req as AuthedRequest, ctx);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }
  };
}

export async function parseBody<T>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function notFound(entity = "Resource") {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}
