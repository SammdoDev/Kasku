import { NextResponse } from "next/server";
import { signToken } from "@/lib/helper/jwt";
import { createServiceClient } from "@/lib/supabase/client";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=google_failed`,
    );
  }

  // 1. Tukar code dengan access_token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=google_failed`,
    );
  }

  const tokens: GoogleTokenResponse = await tokenRes.json();

  // 2. Ambil info user dari Google
  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=google_failed`,
    );
  }

  const googleUser: GoogleUserInfo = await userRes.json();
  const supabase = createServiceClient();

  // 3. Cari user by google_id
  let { data: user } = await supabase
    .from("users")
    .select("id, username, full_name")
    .eq("google_id", googleUser.sub)
    .single();

  // 4. Belum ada → buat user baru
  if (!user) {
    const baseUsername = googleUser.name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20);

    let username = baseUsername;
    let attempt = 0;
    while (true) {
      const { data: taken } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();
      if (!taken) break;
      attempt++;
      username = `${baseUsername}_${attempt}`;
    }

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        username,
        email: googleUser.email,
        google_id: googleUser.sub,
        full_name: googleUser.name,
        avatar_url: googleUser.picture,
      })
      .select("id, username, full_name")
      .single();

    if (error || !newUser) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=google_failed`,
      );
    }

    user = newUser;
  }

  // 5. Buat JWT
  const token = await signToken({
    sub: user.id,
    username: user.username,
    full_name: user.full_name ?? user.username,
  });

  // 6. Simpan token sementara di Supabase (bukan di URL langsung)
  //    session_id = random UUID, expire 5 menit
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase
    .from("auth_temp_tokens")
    .insert({
      session_id: sessionId,
      token,
      expires_at: expiresAt,
    });

  if (insertError) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=google_failed`,
    );
  }

  // 7. Redirect hanya dengan session_id (bukan token sensitif)
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?session_id=${sessionId}`,
  );
}
