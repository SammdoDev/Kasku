import { NextResponse } from "next/server";
import { signToken } from "@/lib/helper/jwt";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  const { username, password: encodedPassword, full_name } = await req.json();

  if (!username || !encodedPassword) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  if (username.length < 3) {
    return NextResponse.json(
      { error: "Username must be at least 3 characters" },
      { status: 400 },
    );
  }

  const password = Buffer.from(encodedPassword, "base64").toString("utf-8");

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 },
    );
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from("users")
    .insert({ username, password_hash, full_name: full_name ?? "" })
    .select("id, username, full_name")
    .single();

  if (error || !user) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }

  const token = await signToken({ sub: user.id, username: user.username });

  const payload = {
    message: "Akun berhasil dibuat! Selamat datang di KasKu.",
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
    },
    token,
  };

  const res = NextResponse.json(payload);
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
