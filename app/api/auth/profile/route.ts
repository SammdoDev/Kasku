import { NextResponse } from "next/server";
import { withAuth, AuthedRequest } from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

export const GET = withAuth(async (req: AuthedRequest) => {
  const supabase = createServiceClient();

  const { data: user, error } = await supabase
    .from("users")
    .select(
      "id, username, full_name, email, currency, avatar_url, created_at, updated_at, google_id", // pastikan google_id ada di sini
    )
    .eq("id", req.user.sub)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
});

export const PATCH = withAuth(async (req: AuthedRequest) => {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const allowed = ["full_name", "avatar_url", "currency"];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const { data: user, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", req.user.sub)
    .select("id, username, full_name, email, currency, avatar_url, updated_at")
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({ user });
});
