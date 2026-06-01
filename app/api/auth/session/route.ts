import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return NextResponse.json(
        { message: "session_id required" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Ambil token berdasarkan session_id
    const { data, error } = await supabase
      .from("auth_temp_tokens")
      .select("token, expires_at")
      .eq("session_id", session_id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: "Session tidak ditemukan" },
        { status: 404 },
      );
    }

    // Cek apakah sudah expired
    if (new Date(data.expires_at) < new Date()) {
      await supabase
        .from("auth_temp_tokens")
        .delete()
        .eq("session_id", session_id);
      return NextResponse.json(
        { message: "Session sudah expired" },
        { status: 410 },
      );
    }

    // Hapus setelah diambil (one-time use)
    await supabase
      .from("auth_temp_tokens")
      .delete()
      .eq("session_id", session_id);

    return NextResponse.json({ token: data.token });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
