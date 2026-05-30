// src/app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import { signToken } from "@/lib/helper/jwt";
import { createServiceClient } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { username, password: encodedPassword, full_name } = await req.json();

  // ── Validation ───────────────────────────────────────────
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

  // ── Check duplicate username ─────────────────────────────
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

  // ── Create user ──────────────────────────────────────────
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
      { error: "Failed to create account" },
      { status: 500 },
    );
  }

  // ── Create profile ───────────────────────────────────────
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: user.full_name,
    avatar_url: user.avatar_url ?? null,
    currency: "IDR",
  });

  if (profileError) {
    console.error("[signup] profile insert error:", profileError);
    await supabase.from("users").delete().eq("id", user.id);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 },
    );
  }

  // ── Default payment methods seeder ───────────────────────
  // Categories TIDAK di-seed — user tambah manual via /api/categories
  const defaultPaymentMethods = [
    { name: "Cash", type: "cash", icon: "Wallet" },
    { name: "BCA", type: "bank", icon: "Building2" },
    { name: "GoPay", type: "ewallet", icon: "Smartphone" },
    { name: "OVO", type: "ewallet", icon: "Smartphone" },
  ];

  await supabase
    .from("payment_methods")
    .insert(defaultPaymentMethods.map((p) => ({ ...p, user_id: user.id })));

  // ── Issue JWT ─────────────────────────────────────────────
  const token = await signToken({ sub: user.id, username: user.username });

  const res = NextResponse.json({
    message: "Akun berhasil dibuat! Selamat datang di KasKu.",
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
