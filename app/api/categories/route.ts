// src/app/api/categories/route.ts

import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

// GET /api/categories?type=income|expense
export const GET = withAuth(async (req: AuthedRequest) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const supabase = createServiceClient();

  let query = supabase
    .from("categories")
    .select("id, name, icon, color, type, created_at, updated_at")
    .eq("user_id", req.user.sub)
    .order("type")
    .order("name");

  if (type === "income" || type === "expense") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[categories] get error:", error);
    return serverError();
  }

  return NextResponse.json({ categories: data });
});

// POST /api/categories
// Body: { name, type, icon?, color? }
//
// icon: OpenMoji hexcode string.
//   Single codepoint  → "1F4B0"
//   Multi-codepoint   → "1F9D1-200D-1F4BB"  (joined by hyphens)
//   Render via: https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@15.1.0/color/svg/{HEXCODE}.svg
//
// color: hex string, e.g. "#f97316"
export const POST = withAuth(async (req: AuthedRequest) => {
  let body: {
    name?: string;
    icon?: string;
    color?: string;
    type?: string;
  };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { name, icon, color, type } = body;

  if (!name || !type) return badRequest("name and type are required");
  if (!["income", "expense"].includes(type))
    return badRequest("type must be 'income' or 'expense'");
  if (name.trim().length < 1) return badRequest("name cannot be empty");

  // icon must be an OpenMoji hexcode string.
  // Valid formats:
  //   - Single codepoint:   "1F4B0"  (4-6 uppercase hex chars)
  //   - Multi-codepoint:    "1F9D1-200D-1F4BB"  (segments joined by "-")
  // Regex: one or more hex segments (4-6 chars) separated by hyphens.
  if (icon !== undefined && icon !== null) {
    if (
      typeof icon !== "string" ||
      !/^[0-9A-Fa-f]{4,6}(-[0-9A-Fa-f]{4,6})*$/.test(icon)
    ) {
      return badRequest(
        "icon must be an OpenMoji hexcode (e.g. '1F4B0' or '1F9D1-200D-1F4BB'). " +
          "See https://openmoji.org/library/ for available emojis.",
      );
    }
  }

  // color must be a valid hex color
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
    .from("categories")
    .insert({
      user_id: req.user.sub,
      name: name.trim(),
      // Normalize to uppercase for consistency with OpenMoji filenames
      icon: icon ? icon.toUpperCase() : null,
      color: color ?? null,
      type,
    })
    .select("id, name, icon, color, type, created_at")
    .single();

  if (error) {
    console.error("[categories] insert error:", error);
    return serverError("Failed to create category");
  }

  return NextResponse.json({ category: data }, { status: 201 });
});
