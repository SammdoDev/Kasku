import { NextResponse } from "next/server";
import { signToken } from "@/lib/helper/jwt";
import { createServiceClient } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password: passwordBase64 } = body;

    if (!username || !passwordBase64) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi" },
        { status: 400 },
      );
    }

    const password = Buffer.from(passwordBase64, "base64").toString("utf-8");

    const supabase = createServiceClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, full_name, password_hash")
      .eq("username", username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 },
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        { message: "Akun ini menggunakan login Google" },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 },
      );
    }

    const token = await signToken({
      sub: user.id,
      username: user.username,
      full_name: user.full_name ?? user.username,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name ?? user.username,
      },
      message: "Login berhasil",
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
