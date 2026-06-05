// src/app/api/transactions/[id]/route.ts

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

// GET /api/transactions/[id]
export const GET = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      id, type, amount, note, date, created_at, updated_at,
      category:categories(id, name, icon, color, type),
      payment_method:payment_methods(id, name, type, icon),
      tags:transaction_tags(tag:tags(id, name, color))
    `,
    )
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (error || !data) return notFound("Transaction");

  const transaction = {
    ...data,
    tags: (data.tags as Array<{ tag: unknown }>).map((t) => t.tag),
  };

  return NextResponse.json({ transaction });
});

// PATCH /api/transactions/[id]
export const PATCH = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  let body: {
    type?: string;
    amount?: number;
    note?: string | null;
    date?: string;
    category_id?: string | null;
    payment_method_id?: string | null;
    tag_ids?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (body.type && !["income", "expense"].includes(body.type)) {
    return badRequest("type must be 'income' or 'expense'");
  }
  if (body.amount !== undefined && Number(body.amount) <= 0) {
    return badRequest("amount must be positive");
  }
  if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return badRequest("date must be in YYYY-MM-DD format");
  }

  const supabase = createServiceClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Transaction");

  // Verify category if provided
  if (body.category_id) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("id", body.category_id)
      .eq("user_id", req.user.sub)
      .single();
    if (!cat) return badRequest("Category not found or does not belong to you");
  }

  // Verify payment method if provided
  if (body.payment_method_id) {
    const { data: pm } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("id", body.payment_method_id)
      .eq("user_id", req.user.sub)
      .single();
    if (!pm)
      return badRequest("Payment method not found or does not belong to you");
  }

  // Verify tags if provided
  if (body.tag_ids && body.tag_ids.length > 0) {
    const { data: userTags } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", req.user.sub)
      .in("id", body.tag_ids);

    if ((userTags ?? []).length !== body.tag_ids.length) {
      return badRequest("One or more tag IDs are invalid");
    }
  }

  // Build transaction updates (exclude tag_ids)
  const allowed = [
    "type",
    "amount",
    "note",
    "date",
    "category_id",
    "payment_method_id",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = (body as Record<string, unknown>)[key];
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", params.id);

    if (updateError) {
      console.error("[transactions] update error:", updateError);
      return serverError("Failed to update transaction");
    }
  }

  // Replace tags if tag_ids provided (replace-all strategy)
  if ("tag_ids" in body && Array.isArray(body.tag_ids)) {
    // Delete old tags
    await supabase
      .from("transaction_tags")
      .delete()
      .eq("transaction_id", params.id);

    // Insert new tags
    if (body.tag_ids.length > 0) {
      await supabase
        .from("transaction_tags")
        .insert(
          body.tag_ids.map((tag_id) => ({ transaction_id: params.id, tag_id })),
        );
    }
  }

  // Return updated transaction
  const { data } = await supabase
    .from("transactions")
    .select(
      `
      id, type, amount, note, date, created_at, updated_at,
      category:categories(id, name, icon, color, type),
      payment_method:payment_methods(id, name, type, icon),
      tags:transaction_tags(tag:tags(id, name, color))
    `,
    )
    .eq("id", params.id)
    .single();

  const transaction = {
    ...data,
    tags: ((data as { tags: Array<{ tag: unknown }> } | null)?.tags ?? []).map(
      (t) => t.tag,
    ),
  };

  return NextResponse.json({ transaction });
});

// DELETE /api/transactions/[id]
export const DELETE = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Transaction");

  // transaction_tags cascade on delete, no need to delete manually
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", params.id);

  if (error) {
    console.error("[transactions] delete error:", error);
    return serverError("Failed to delete transaction");
  }

  return NextResponse.json({ message: "Transaction deleted" });
});
