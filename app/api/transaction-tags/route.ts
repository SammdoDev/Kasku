import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  notFound,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

/** Verify transaction belongs to user */
async function getTransaction(
  supabase: ReturnType<typeof createServiceClient>,
  txId: string,
  userId: string,
) {
  const { data } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", txId)
    .eq("user_id", userId)
    .single();
  return data;
}

// GET /api/transaction-tags?transaction_id=xxx
export const GET = withAuth(async (req: AuthedRequest) => {
  const { searchParams } = new URL(req.url);
  const txId = searchParams.get("transaction_id");

  if (!txId) return badRequest("transaction_id is required");

  const supabase = createServiceClient();

  const tx = await getTransaction(supabase, txId, req.user.sub);
  if (!tx) return notFound("Transaction");

  const { data, error } = await supabase
    .from("transaction_tags")
    .select("tag:tags(id, name, color)")
    .eq("transaction_id", txId);

  if (error) {
    console.error("[transaction-tags] fetch error:", error);
    return serverError("Failed to fetch tags");
  }

  const tags = (data ?? []).map((row) => row.tag);

  return NextResponse.json({ tags });
});

// POST /api/transaction-tags
// body: { transaction_id: string; tag_ids: string[] }
export const POST = withAuth(async (req: AuthedRequest) => {
  let body: { transaction_id: string; tag_ids: string[] };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body.transaction_id || typeof body.transaction_id !== "string")
    return badRequest("transaction_id is required");

  if (
    !Array.isArray(body.tag_ids) ||
    body.tag_ids.length === 0 ||
    body.tag_ids.some((t) => typeof t !== "string")
  )
    return badRequest("tag_ids must be a non-empty array of strings");

  const supabase = createServiceClient();

  // Verify transaction milik user
  const tx = await getTransaction(supabase, body.transaction_id, req.user.sub);
  if (!tx) return notFound("Transaction");

  // Verify semua tag milik user
  const { data: ownedTags } = await supabase
    .from("tags")
    .select("id")
    .in("id", body.tag_ids)
    .eq("user_id", req.user.sub);

  const ownedIds = new Set((ownedTags ?? []).map((t) => t.id));
  const invalid = body.tag_ids.filter((id) => !ownedIds.has(id));
  if (invalid.length > 0)
    return badRequest(`Tag(s) not found: ${invalid.join(", ")}`);

  // Upsert — ignore duplikat
  const rows = body.tag_ids.map((tag_id) => ({
    transaction_id: body.transaction_id,
    tag_id,
  }));

  const { error } = await supabase
    .from("transaction_tags")
    .upsert(rows, { onConflict: "transaction_id,tag_id", ignoreDuplicates: true });

  if (error) {
    console.error("[transaction-tags] attach error:", error);
    return serverError("Failed to attach tags");
  }

  return NextResponse.json({ message: "Tags attached" }, { status: 201 });
});

// DELETE /api/transaction-tags
// body: { transaction_id: string; tag_ids: string[] }
export const DELETE = withAuth(async (req: AuthedRequest) => {
  let body: { transaction_id: string; tag_ids: string[] };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body.transaction_id || typeof body.transaction_id !== "string")
    return badRequest("transaction_id is required");

  if (
    !Array.isArray(body.tag_ids) ||
    body.tag_ids.length === 0 ||
    body.tag_ids.some((t) => typeof t !== "string")
  )
    return badRequest("tag_ids must be a non-empty array of strings");

  const supabase = createServiceClient();

  // Verify transaction milik user
  const tx = await getTransaction(supabase, body.transaction_id, req.user.sub);
  if (!tx) return notFound("Transaction");

  const { error } = await supabase
    .from("transaction_tags")
    .delete()
    .eq("transaction_id", body.transaction_id)
    .in("tag_id", body.tag_ids);

  if (error) {
    console.error("[transaction-tags] detach error:", error);
    return serverError("Failed to detach tags");
  }

  return NextResponse.json({ message: "Tags detached" });
});