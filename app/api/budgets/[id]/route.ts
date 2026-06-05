// src/app/api/budgets/[id]/route.ts

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

const VALID_PERIODS = ["daily", "weekly", "monthly", "yearly"];

// GET /api/budgets/[id]
export const GET = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("budgets")
    .select(
      `
      id, name, amount, period, start_date, end_date, created_at, updated_at,
      category:categories(id, name, icon, color, type)
    `,
    )
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (error || !data) return notFound("Budget");

  return NextResponse.json({ budget: data });
});

// PATCH /api/budgets/[id]
export const PATCH = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  let body: {
    name?: string;
    amount?: number;
    period?: string;
    start_date?: string;
    end_date?: string | null;
    category_id?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (body.period && !VALID_PERIODS.includes(body.period)) {
    return badRequest(`period must be one of: ${VALID_PERIODS.join(", ")}`);
  }
  if (body.amount !== undefined && Number(body.amount) <= 0) {
    return badRequest("amount must be positive");
  }

  const allowed = [
    "name",
    "amount",
    "period",
    "start_date",
    "end_date",
    "category_id",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = (body as Record<string, unknown>)[key];
  }

  if (Object.keys(updates).length === 0)
    return badRequest("No valid fields to update");

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Budget");

  if ("category_id" in updates && updates.category_id) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("id", updates.category_id)
      .eq("user_id", req.user.sub)
      .single();
    if (!cat) return badRequest("Category not found or does not belong to you");
  }

  const { data, error } = await supabase
    .from("budgets")
    .update(updates)
    .eq("id", params.id)
    .select(
      `
      id, name, amount, period, start_date, end_date, updated_at,
      category:categories(id, name, icon, color, type)
    `,
    )
    .single();

  if (error) {
    console.error("[budgets] update error:", error);
    return serverError("Failed to update budget");
  }

  return NextResponse.json({ budget: data });
});

// DELETE /api/budgets/[id]
export const DELETE = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Budget");

  const { error } = await supabase.from("budgets").delete().eq("id", params.id);

  if (error) {
    console.error("[budgets] delete error:", error);
    return serverError("Failed to delete budget");
  }

  return NextResponse.json({ message: "Budget deleted" });
});
