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

export const GET = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `id, type, amount, note, date, transfer_pair_id, created_at,
      category:categories(id, name, icon, color, type),
      payment_method:payment_methods(id, name, type, icon),
      tags:transaction_tags(tag:tags(id, name, color))`,
    )
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (error || !data) return notFound("Transaction");

  const response = {
    ...data,
    tags: ((data as { tags: Array<{ tag: unknown }> })?.tags ?? []).map(
      (t) => t.tag,
    ),
  };

  return NextResponse.json({ transaction: response });
});

export const PATCH = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
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

  const supabase = createServiceClient();
  const userId = req.user.sub;

  // Get existing transaction
  const { data: existing } = await supabase
    .from("transactions")
    .select("id, type, amount, payment_method_id")
    .eq("id", params.id)
    .eq("user_id", userId)
    .single();

  if (!existing) return notFound("Transaction");

  const updates: Record<string, unknown> = {};
  if ("type" in body) {
    if (!["income", "expense"].includes(body.type!))
      return badRequest("Invalid type");
    updates.type = body.type;
  }
  if ("amount" in body) {
    if (Number(body.amount) <= 0) return badRequest("amount must be positive");
    updates.amount = body.amount;
  }
  if ("note" in body) updates.note = body.note ?? null;
  if ("date" in body) updates.date = body.date;
  if ("category_id" in body) updates.category_id = body.category_id ?? null;
  if ("payment_method_id" in body)
    updates.payment_method_id = body.payment_method_id ?? null;

  if (Object.keys(updates).length === 0 && !body.tag_ids)
    return badRequest("No fields to update");

  // Reverse old balance
  if (existing.payment_method_id) {
    const oldDelta =
      existing.type === "income"
        ? -Number(existing.amount)
        : Number(existing.amount);
    await supabase.rpc("increment_balance", {
      pm_id: existing.payment_method_id,
      delta: oldDelta,
    });
  }

  const { data: txn, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", params.id)
    .select("id, type, amount, payment_method_id")
    .single();

  if (error || !txn) {
    console.error("[transactions] update error:", error);
    return serverError("Failed to update");
  }

  // Apply new balance
  const newPmId = (
    "payment_method_id" in updates
      ? updates.payment_method_id
      : existing.payment_method_id
  ) as string | null;
  const newType = (updates.type ?? existing.type) as string;
  const newAmount = Number(updates.amount ?? existing.amount);

  if (newPmId) {
    const newDelta = newType === "income" ? newAmount : -newAmount;
    await supabase.rpc("increment_balance", {
      pm_id: newPmId,
      delta: newDelta,
    });
  }

  // Update tags
  if (body.tag_ids !== undefined) {
    await supabase
      .from("transaction_tags")
      .delete()
      .eq("transaction_id", params.id);
    if (body.tag_ids.length > 0) {
      await supabase
        .from("transaction_tags")
        .insert(
          body.tag_ids.map((tag_id) => ({ transaction_id: params.id, tag_id })),
        );
    }
  }

  return NextResponse.json({ message: "Transaction updated" });
});

export const DELETE = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();
  const userId = req.user.sub;

  const { data: txn } = await supabase
    .from("transactions")
    .select("id, type, amount, payment_method_id, transfer_pair_id")
    .eq("id", params.id)
    .eq("user_id", userId)
    .single();

  if (!txn) return notFound("Transaction");

  // If transfer, delete pair too and reverse both balances
  if (txn.transfer_pair_id) {
    const { data: pair } = await supabase
      .from("transactions")
      .select("id, type, amount, payment_method_id")
      .eq("transfer_pair_id", txn.transfer_pair_id)
      .eq("user_id", userId);

    for (const t of pair ?? []) {
      if (t.payment_method_id) {
        const delta =
          t.type === "income" ? -Number(t.amount) : Number(t.amount);
        await supabase.rpc("increment_balance", {
          pm_id: t.payment_method_id,
          delta,
        });
      }
    }

    await supabase
      .from("transactions")
      .delete()
      .eq("transfer_pair_id", txn.transfer_pair_id);
    return NextResponse.json({ message: "Transfer deleted" });
  }

  // Reverse balance
  if (txn.payment_method_id) {
    const delta =
      txn.type === "income" ? -Number(txn.amount) : Number(txn.amount);
    await supabase.rpc("increment_balance", {
      pm_id: txn.payment_method_id,
      delta,
    });
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", params.id);
  if (error) {
    console.error("[transactions] delete error:", error);
    return serverError("Failed to delete");
  }

  return NextResponse.json({ message: "Transaction deleted" });
});
