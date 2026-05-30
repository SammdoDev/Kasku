// src/app/api/categories/[id]/route.ts

import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  notFound,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

type Ctx = { params: { id: string } };

// GET /api/categories/[id]
export const GET = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon, color, type, created_at, updated_at")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (error || !data) return notFound("Category");

  return NextResponse.json({ category: data });
});

// PATCH /api/categories/[id]
// icon: nama Lucide icon (e.g. "Wallet"), bukan emoji
export const PATCH = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  let body: {
    name?: string;
    icon?: string | null;
    color?: string | null;
    type?: string;
  };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (body.type && !["income", "expense"].includes(body.type)) {
    return badRequest("type must be 'income' or 'expense'");
  }

  if (body.icon !== undefined && body.icon !== null) {
    if (typeof body.icon !== "string" || !/^[A-Za-z0-9]+$/.test(body.icon)) {
      return badRequest(
        "icon must be a Lucide icon name (e.g. 'Wallet', 'ShoppingCart'). See https://lucide.dev/icons",
      );
    }
  }

  if (body.color !== undefined && body.color !== null) {
    if (
      typeof body.color !== "string" ||
      !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(body.color)
    ) {
      return badRequest("color must be a valid hex color (e.g. '#f97316')");
    }
  }

  const allowed = ["name", "icon", "color", "type"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = (body as Record<string, unknown>)[key];
  }

  if (Object.keys(updates).length === 0)
    return badRequest("No valid fields to update");

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Category");

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", params.id)
    .select("id, name, icon, color, type, updated_at")
    .single();

  if (error) {
    console.error("[categories] update error:", error);
    return serverError("Failed to update category");
  }

  return NextResponse.json({ category: data });
});

// DELETE /api/categories/[id]
export const DELETE = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Category");

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", params.id);

  if (error) {
    console.error("[categories] delete error:", error);
    return serverError("Failed to delete category");
  }

  return NextResponse.json({ message: "Category deleted" });
});
