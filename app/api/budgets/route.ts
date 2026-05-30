// src/app/api/budgets/route.ts

import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

const VALID_PERIODS = ["daily", "weekly", "monthly", "yearly"];

// GET /api/budgets?period=monthly&active=true
export const GET = withAuth(async (req: AuthedRequest) => {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period");
  const active = searchParams.get("active"); // "true" = filter budgets with end_date >= today or null

  const supabase = createServiceClient();

  let query = supabase
    .from("budgets")
    .select(
      `
      id,
      name,
      amount,
      period,
      start_date,
      end_date,
      created_at,
      updated_at,
      category:categories(id, name, icon, color, type)
    `,
    )
    .eq("user_id", req.user.sub)
    .order("created_at", { ascending: false });

  if (period && VALID_PERIODS.includes(period)) {
    query = query.eq("period", period);
  }

  if (active === "true") {
    const today = new Date().toISOString().split("T")[0];
    query = query.or(`end_date.is.null,end_date.gte.${today}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[budgets] get error:", error);
    return serverError();
  }

  // Attach spending for each budget
  const today = new Date().toISOString().split("T")[0];
  const budgetsWithSpending = await Promise.all(
    (data ?? []).map(async (budget) => {
      // Calculate date range based on period
      const startDate = getPeriodStart(budget.period, budget.start_date);
      const endDate = budget.end_date ?? today;

      let spendQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", req.user.sub)
        .eq("type", "expense")
        .gte("date", startDate)
        .lte("date", endDate);

      if (
        budget.category &&
        typeof budget.category === "object" &&
        "id" in budget.category
      ) {
        spendQuery = spendQuery.eq("category_id", budget.category.id);
      }

      const { data: txns } = await spendQuery;
      const spent = (txns ?? []).reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        ...budget,
        spent,
        remaining: Number(budget.amount) - spent,
        percent_used: Math.min(
          100,
          Math.round((spent / Number(budget.amount)) * 100),
        ),
      };
    }),
  );

  return NextResponse.json({ budgets: budgetsWithSpending });
});

// POST /api/budgets
export const POST = withAuth(async (req: AuthedRequest) => {
  let body: {
    name?: string;
    amount?: number;
    period?: string;
    start_date?: string;
    end_date?: string;
    category_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { name, amount, period, start_date, end_date, category_id } = body;

  if (!name || !amount || !period || !start_date) {
    return badRequest("name, amount, period, and start_date are required");
  }
  if (!VALID_PERIODS.includes(period)) {
    return badRequest(`period must be one of: ${VALID_PERIODS.join(", ")}`);
  }
  if (Number(amount) <= 0) return badRequest("amount must be positive");

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
    return badRequest("start_date must be in YYYY-MM-DD format");
  }
  if (end_date && !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
    return badRequest("end_date must be in YYYY-MM-DD format");
  }

  const supabase = createServiceClient();

  // Verify category belongs to user if provided
  if (category_id) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .eq("user_id", req.user.sub)
      .single();

    if (!cat) return badRequest("Category not found or does not belong to you");
  }

  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: req.user.sub,
      name: name.trim(),
      amount,
      period,
      start_date,
      end_date: end_date ?? null,
      category_id: category_id ?? null,
    })
    .select(
      `
      id, name, amount, period, start_date, end_date, created_at,
      category:categories(id, name, icon, color, type)
    `,
    )
    .single();

  if (error) {
    console.error("[budgets] insert error:", error);
    return serverError("Failed to create budget");
  }

  return NextResponse.json({ budget: data }, { status: 201 });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPeriodStart(period: string, budgetStart: string): string {
  const now = new Date();
  switch (period) {
    case "daily":
      return now.toISOString().split("T")[0];
    case "weekly": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Mon
      return new Date(now.setDate(diff)).toISOString().split("T")[0];
    }
    case "monthly":
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    case "yearly":
      return `${now.getFullYear()}-01-01`;
    default:
      return budgetStart;
  }
}
