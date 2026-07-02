import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";
import {
  getCycleStartDate,
  calculateCycleDateRange,
  getCurrentCycleMonth,
} from "@/lib/helper/cycle-date";

export const GET = withAuth(async (req: AuthedRequest) => {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const category_id = searchParams.get("category_id");
  const payment_method_id = searchParams.get("payment_method_id");
  const tag_id = searchParams.get("tag_id");
  const monthParam = searchParams.get("month");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20")),
  );
  const offset = (page - 1) * limit;

  const supabase = createServiceClient();
  const cycleStart = await getCycleStartDate(supabase, req.user.sub);

  const month = monthParam ?? getCurrentCycleMonth(cycleStart);

  let query = supabase
    .from("transactions")
    .select(
      `id, type, amount, note, date, transfer_pair_id, created_at, updated_at,
      category:categories(id, name, icon, color, type),
      payment_method:payment_methods(id, name, type, icon),
      tags:transaction_tags(tag:tags(id, name, color))`,
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

  // Selalu filter by cycle date range sekarang (gak lagi kondisional `if (month)`)
  const { from, to } = calculateCycleDateRange(month, cycleStart);
  query = query.gte("date", from).lte("date", to);

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

  const transactions = (data ?? []).map((txn) => ({
    ...txn,
    tags: (txn.tags as Array<{ tag: unknown }>).map((t) => t.tag),
  }));

  const total = count ?? 0;
  return NextResponse.json({
    transactions,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    period: { month, date_from: from, date_to: to },
  });
});

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
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { type, amount, note, date, category_id, payment_method_id, tag_ids } =
    body;

  if (!type || !amount) return badRequest("type and amount are required");
  if (!["income", "expense"].includes(type))
    return badRequest("type must be 'income' or 'expense'");
  if (Number(amount) <= 0) return badRequest("amount must be positive");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return badRequest("date must be in YYYY-MM-DD format");

  const supabase = createServiceClient();
  const userId = req.user.sub;

  if (category_id) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .eq("user_id", userId)
      .single();
    if (!cat) return badRequest("Category not found or does not belong to you");
  }

  if (payment_method_id) {
    const { data: pm } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("id", payment_method_id)
      .eq("user_id", userId)
      .single();
    if (!pm)
      return badRequest("Payment method not found or does not belong to you");
  }

  if (tag_ids && tag_ids.length > 0) {
    const { data: userTags } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", userId)
      .in("id", tag_ids);
    if ((userTags ?? []).length !== tag_ids.length)
      return badRequest("One or more tag IDs are invalid");
  }

  const { data: txn, error: txnError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
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

  if (payment_method_id) {
    const delta = type === "income" ? Number(amount) : -Number(amount);
    const { error: balErr } = await supabase.rpc("increment_balance", {
      pm_id: payment_method_id,
      delta,
    });
    if (balErr) console.error("[transactions] balance update error:", balErr);
  }

  if (tag_ids && tag_ids.length > 0) {
    await supabase
      .from("transaction_tags")
      .insert(tag_ids.map((tag_id) => ({ transaction_id: txn.id, tag_id })));
  }

  const { data: full } = await supabase
    .from("transactions")
    .select(
      `id, type, amount, note, date, created_at,
      category:categories(id, name, icon, color, type),
      payment_method:payment_methods(id, name, type, icon),
      tags:transaction_tags(tag:tags(id, name, color))`,
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
