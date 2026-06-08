import { NextResponse } from "next/server";
import { signToken } from "@/lib/helper/jwt";
import { createServiceClient } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { username, password: encodedPassword, full_name } = await req.json();

  if (!username || !encodedPassword) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 },
    );
  }

  if (username.length < 3) {
    return NextResponse.json(
      { message: "Username must be at least 3 characters" },
      { status: 400 },
    );
  }

  const password = Buffer.from(encodedPassword, "base64").toString("utf-8");

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters" },
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
      { message: "Username already taken" },
      { status: 409 },
    );
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      username,
      password_hash,
      full_name: full_name ?? "",
      currency: "IDR",
    })
    .select("id, username, full_name, currency, avatar_url, created_at")
    .single();

  if (userError || !user) {
    console.error("[signup] user insert error:", userError);
    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 },
    );
  }

  const defaultPaymentMethods = [
    { name: "Cash", type: "cash", icon: "Wallet" },
    { name: "BCA", type: "bank", icon: "Building2" },
    { name: "GoPay", type: "ewallet", icon: "Smartphone" },
    { name: "OVO", type: "ewallet", icon: "Smartphone" },
  ];

  await supabase
    .from("payment_methods")
    .insert(defaultPaymentMethods.map((p) => ({ ...p, user_id: user.id })));

  const token = await signToken({
    sub: user.id,
    username: user.username,
    full_name: user.full_name ?? "",
  });

  return NextResponse.json({
    message: "Akun berhasil dibuat! Selamat datang di Cashora.",
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
    },
    token,
  });
}
