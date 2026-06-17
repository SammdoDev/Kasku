import { NextResponse } from "next/server";
import { withAuth, AuthedRequest } from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

export const POST = withAuth(async (req: AuthedRequest) => {
  let body: { old_password?: string; new_password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { old_password: encodedOld, new_password: encodedNew } = body;

  if (!encodedOld || !encodedNew) {
    return NextResponse.json(
      { message: "Password lama dan baru wajib diisi" },
      { status: 400 },
    );
  }

  const oldPassword = Buffer.from(encodedOld, "base64").toString("utf-8");
  const newPassword = Buffer.from(encodedNew, "base64").toString("utf-8");

  if (newPassword.length < 6) {
    return NextResponse.json(
      { message: "Password baru minimal 6 karakter" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", req.user.sub)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { message: "User tidak ditemukan" },
      { status: 404 },
    );
  }

  if (!user.password_hash) {
    return NextResponse.json(
      {
        message: "Akun ini menggunakan login Google, tidak bisa ganti password",
      },
      { status: 400 },
    );
  }

  const isValid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isValid) {
    return NextResponse.json(
      { message: "Password lama tidak sesuai" },
      { status: 401 },
    );
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash: newHash })
    .eq("id", req.user.sub);

  if (updateError) {
    return NextResponse.json(
      { message: "Gagal memperbarui password" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Password berhasil diubah" });
});
