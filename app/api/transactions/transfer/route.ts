import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";
import { randomUUID } from "crypto";

export const POST = withAuth(async (req: AuthedRequest) => {
  let body: {
    amount?: number;
    from_payment_method_id?: string;
    to_payment_method_id?: string;
    note?: string;
    date?: string;
  };

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { amount, from_payment_method_id, to_payment_method_id, note, date } =
    body;

  if (!amount || Number(amount) <= 0)
    return badRequest("amount must be positive");
  if (!from_payment_method_id)
    return badRequest("from_payment_method_id is required");
  if (!to_payment_method_id)
    return badRequest("to_payment_method_id is required");
  if (from_payment_method_id === to_payment_method_id)
    return badRequest("from and to cannot be the same");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return badRequest("date must be in YYYY-MM-DD format");

  const supabase = createServiceClient();
  const userId = req.user.sub;
  const txDate = date ?? new Date().toISOString().split("T")[0];

  const { data: pms } = await supabase
    .from("payment_methods")
    .select("id, name, balance")
    .eq("user_id", userId)
    .in("id", [from_payment_method_id, to_payment_method_id]);

  if ((pms ?? []).length !== 2)
    return badRequest("One or both payment methods not found");

  const fromPm = pms!.find((p) => p.id === from_payment_method_id);

  if (fromPm && Number(fromPm.balance) < Number(amount)) {
    return NextResponse.json(
      {
        error: `Saldo ${fromPm.name} tidak cukup. Saldo saat ini: ${fromPm.balance}`,
      },
      { status: 422 },
    );
  }

  // --- auto create/reuse kategori Transfer ---
  let transferCategoryId: string | null = null;

  const { data: existingCat } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .eq("name", "Transfer")
    .maybeSingle();

  if (existingCat) {
    transferCategoryId = existingCat.id;
  } else {
    const { data: newCat, error: catErr } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: "Transfer",
        type: "expense",
        icon: "1F4B8",
        color: "#6366f1",
      })
      .select("id")
      .single();

    if (catErr) {
      console.error("[transfer] failed to create category:", catErr);
    } else {
      transferCategoryId = newCat.id;
    }
  }
  // ------------------------------------------

  const transfer_pair_id = randomUUID();

  const { error: insertError } = await supabase.from("transactions").insert([
    {
      user_id: userId,
      type: "expense",
      amount,
      note: note ?? null,
      date: txDate,
      payment_method_id: from_payment_method_id,
      category_id: transferCategoryId,
      transfer_pair_id,
    },
    {
      user_id: userId,
      type: "income",
      amount,
      note: note ?? null,
      date: txDate,
      payment_method_id: to_payment_method_id,
      category_id: transferCategoryId,
      transfer_pair_id,
    },
  ]);

  if (insertError) {
    console.error("[transfer] insert error:", insertError);
    return serverError("Failed to create transfer");
  }

  const { error: fromErr } = await supabase.rpc("increment_balance", {
    pm_id: from_payment_method_id,
    delta: -Number(amount),
  });
  const { error: toErr } = await supabase.rpc("increment_balance", {
    pm_id: to_payment_method_id,
    delta: Number(amount),
  });

  if (fromErr || toErr)
    console.error("[transfer] balance update error:", fromErr, toErr);

  return NextResponse.json(
    { message: "Transfer recorded", transfer_pair_id },
    { status: 201 },
  );
});
