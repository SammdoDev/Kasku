// src/app/api/transactions/route.ts

import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

// GET /api/transactions
// Query params:
//   type         = income | expense
//   category_id  = UUID
//   payment_method_id = UUID
//   tag_id       = UUID
//   date_from    = YYYY-MM-DD
//   date_to      = YYYY-MM-DD
//   page         = number (default 1)
//   limit        = number (default 20, max 100)
export const GET = withAuth(async (req: AuthedRequest) => {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const category_id = searchParams.get("category_id");
  const payment_method_id = searchParams.get("payment_method_id");
  const tag_id = searchParams.get("tag_id");
  const date_from = searchParams.get("date_from");
  const date_to = searchParams.get("date_to");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20")),
  );
  const offset = (page - 1) * limit;

  const supabase = createServiceClient();

  let query = supabase
    .from("transactions")
    .select(
      `
      id, type, amount, note, date, created_at, updated_at,
      category:categories(id, name, icon, color, type),
      payment_method:payment_methods(id, name, type, icon),
      tags:transaction_tags(tag:tags(id, name, color))
    `,
      { count: "exact" },
    )
    .eq("user_id", req.user.sub)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type === "income" || type === "expense") query = query.eq("type", type);
  if (category_id) query = query.eq("category_id", category_id);
  if (payment_method_id)
    query = query.eq("payment_method_id", payment_method_id);
  if (date_from) query = query.gte("date", date_from);
  if (date_to) query = query.lte("date", date_to);

  // Filter by tag via a subquery (find transaction IDs that have the tag)
  if (tag_id) {
    const { data: taggedTxns } = await supabase
      .from("transaction_tags")
      .select("transaction_id")
      .eq("tag_id", tag_id);

    const ids = (taggedTxns ?? []).map((t) => t.transaction_id);
    if (ids.length === 0) {
      return NextResponse.json({
        transactions: [],
        pagination: { page, limit, total: 0, total_pages: 0 },
      });
    }
    query = query.in("id", ids);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[transactions] get error:", error);
    return serverError();
  }

  // Flatten tags from junction format
  const transactions = (data ?? []).map((txn) => ({
    ...txn,
    tags: (txn.tags as Array<{ tag: unknown }>).map((t) => t.tag),
  }));

  const total = count ?? 0;

  return NextResponse.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  });
});

// POST /api/transactions
export const POST = withAuth(async (req: AuthedRequest) => {
  let body: {
    type?: string;
    amount?: number;
    note?: string;
    date?: string;
    category_id?: string;
    payment_method_id?: string;
    tag_ids?: string[];
  };
  try {
    body = await req.json();

    console.log("[transactions POST] body:", body);
    console.log("[transactions POST] user:", req.user);
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { type, amount, note, date, category_id, payment_method_id, tag_ids } =
    body;

  if (!type || !amount) return badRequest("type and amount are required");
  if (!["income", "expense"].includes(type))
    return badRequest("type must be 'income' or 'expense'");
  if (Number(amount) <= 0) return badRequest("amount must be positive");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return badRequest("date must be in YYYY-MM-DD format");
  }

  const supabase = createServiceClient();

  // Verify category ownership
  if (category_id) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id, type")
      .eq("id", category_id)
      .eq("user_id", req.user.sub)
      .single();

    if (!cat) return badRequest("Category not found or does not belong to you");
  }

  // Verify payment method ownership
  if (payment_method_id) {
    const { data: pm } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("id", payment_method_id)
      .eq("user_id", req.user.sub)
      .single();

    if (!pm)
      return badRequest("Payment method not found or does not belong to you");
  }

  // Verify all tag IDs belong to user
  if (tag_ids && tag_ids.length > 0) {
    const { data: userTags } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", req.user.sub)
      .in("id", tag_ids);

    if ((userTags ?? []).length !== tag_ids.length) {
      return badRequest("One or more tag IDs are invalid");
    }
  }

  // Insert transaction
  const { data: txn, error: txnError } = await supabase
    .from("transactions")
    .insert({
      user_id: req.user.sub,
      type,
      amount,
      note: note ?? null,
      date: date ?? new Date().toISOString().split("T")[0],
      category_id: category_id ?? null,
      payment_method_id: payment_method_id ?? null,
    })
    .select("id, type, amount, note, date, created_at")
    .single();

  if (txnError || !txn) {
    console.error("[transactions] insert error:", txnError);
    return serverError("Failed to create transaction");
  }

  // Insert transaction_tags
  if (tag_ids && tag_ids.length > 0) {
    const { error: tagError } = await supabase
      .from("transaction_tags")
      .insert(tag_ids.map((tag_id) => ({ transaction_id: txn.id, tag_id })));

    if (tagError) {
      console.error("[transactions] tag insert error:", tagError);
      // Non-fatal: transaction already created
    }
  }

  // Return full transaction with relations
  const { data: full } = await supabase
    .from("transactions")
    .select(
      `
      id, type, amount, note, date, created_at,
      category:categories(id, name, icon, color, type),
      payment_method:payment_methods(id, name, type, icon),
      tags:transaction_tags(tag:tags(id, name, color))
    `,
    )
    .eq("id", txn.id)
    .single();

  const response = {
    ...full,
    tags: ((full as { tags: Array<{ tag: unknown }> })?.tags ?? []).map(
      (t) => t.tag,
    ),
  };

  return NextResponse.json({ transaction: response }, { status: 201 });
});
