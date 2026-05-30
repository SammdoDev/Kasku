// src/app/api/tags/route.ts

import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

// GET /api/tags
export const GET = withAuth(async (req: AuthedRequest) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, color, created_at, updated_at")
    .eq("user_id", req.user.sub)
    .order("name");

  if (error) {
    console.error("[tags] get error:", error);
    return serverError();
  }

  return NextResponse.json({ tags: data });
});

// POST /api/tags
// Body: { name, color? }
// color: hex string, contoh "#f97316"
export const POST = withAuth(async (req: AuthedRequest) => {
  let body: { name?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { name, color } = body;
  if (!name || name.trim().length < 1) return badRequest("name is required");

  if (color !== undefined && color !== null) {
    if (
      typeof color !== "string" ||
      !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)
    ) {
      return badRequest("color must be a valid hex color (e.g. '#f97316')");
    }
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: req.user.sub, name: name.trim(), color: color ?? null })
    .select("id, name, color, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 409 },
      );
    }
    console.error("[tags] insert error:", error);
    return serverError("Failed to create tag");
  }

  return NextResponse.json({ tag: data }, { status: 201 });
});
