import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production",
);

export interface JWTPayload {
  sub: string;
  username: string;
  full_name?: string; // optional supaya sign-up lama tidak error
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">) {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as unknown as JWTPayload;
}
