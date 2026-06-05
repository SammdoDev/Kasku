// src/app/api/tags/[id]/route.ts

import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  notFound,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

type Ctx = { params: Record<string, string> };

// GET /api/tags/[id]
export const GET = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, color, created_at, updated_at")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (error || !data) return notFound("Tag");

  return NextResponse.json({ tag: data });
});

// PATCH /api/tags/[id]
export const PATCH = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  let body: { name?: string; color?: string | null };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const updates: Record<string, unknown> = {};

  if ("name" in body) {
    if (!body.name || body.name.trim().length < 1)
      return badRequest("name cannot be empty");
    updates.name = body.name.trim();
  }

  if ("color" in body) {
    if (
      body.color !== null &&
      (typeof body.color !== "string" ||
        !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(body.color))
    ) {
      return badRequest("color must be a valid hex color (e.g. '#f97316')");
    }
    updates.color = body.color;
  }

  if (Object.keys(updates).length === 0)
    return badRequest("No valid fields to update");

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Tag");

  const { data, error } = await supabase
    .from("tags")
    .update(updates)
    .eq("id", params.id)
    .select("id, name, color, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 409 },
      );
    }
    console.error("[tags] update error:", error);
    return serverError("Failed to update tag");
  }

  return NextResponse.json({ tag: data });
});

// DELETE /api/tags/[id]
export const DELETE = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Tag");

  const { error } = await supabase.from("tags").delete().eq("id", params.id);

  if (error) {
    console.error("[tags] delete error:", error);
    return serverError("Failed to delete tag");
  }

  return NextResponse.json({ message: "Tag deleted" });
});
