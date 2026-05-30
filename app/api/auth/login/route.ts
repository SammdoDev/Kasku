import { NextResponse } from "next/server";
import { signToken } from "@/lib/helper/jwt";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password: encodedPassword } = body;

  if (!username || !encodedPassword) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  let password: string;
  try {
    password = Buffer.from(encodedPassword, "base64").toString("utf-8");
  } catch {
    return NextResponse.json(
      { error: "Invalid password format" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, full_name, password_hash")
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
      { error: "This account uses Google login" },
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

  const token = await signToken({
    sub: user.id,
    username: user.username,
  });

  const res = NextResponse.json({
    message: "Login berhasil! Selamat datang kembali.",
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
    },
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
