// src/app/api/auth/signin/route.ts

import { NextResponse } from "next/server";
import { signToken } from "@/lib/helper/jwt";
import { createServiceClient } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { username, password: encodedPassword } = await req.json();

  if (!username || !encodedPassword) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  const password = Buffer.from(encodedPassword, "base64").toString("utf-8");

  const supabase = createServiceClient();

  const { data: user, error } = await supabase
    .from("users")
    .select(
      "id, username, full_name, password_hash, currency, avatar_url, created_at",
    )
    .eq("username", username)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }

  if (!user.password_hash) {
    return NextResponse.json(
      { error: "This account uses Google login. Please sign in with Google." },
      { status: 401 },
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }

  const token = await signToken({ sub: user.id, username: user.username });

  const res = NextResponse.json({
    message: "Login berhasil!",
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      currency: user.currency,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    },
    token,
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
