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
  const txId = params.id;

  const { data: tx } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", txId)
    .eq("user_id", req.user.sub)
    .single();

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

export const POST = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const txId = params.id;

  let body: { tag_ids: string[] };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (
    !Array.isArray(body.tag_ids) ||
    body.tag_ids.length === 0 ||
    body.tag_ids.some((t) => typeof t !== "string")
  )
    return badRequest("tag_ids must be a non-empty array of strings");

  const supabase = createServiceClient();

  const { data: tx } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", txId)
    .eq("user_id", req.user.sub)
    .single();

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

  const rows = body.tag_ids.map((tag_id) => ({ transaction_id: txId, tag_id }));

  const { error } = await supabase
    .from("transaction_tags")
    .upsert(rows, {
      onConflict: "transaction_id,tag_id",
      ignoreDuplicates: true,
    });

  if (error) {
    console.error("[transaction-tags] attach error:", error);
    return serverError("Failed to attach tags");
  }

  return NextResponse.json({ message: "Tags attached" }, { status: 201 });
});

// DELETE /api/transaction-tags/[id]
// body: { tag_ids: string[] }
export const DELETE = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const txId = params.id;

  let body: { tag_ids: string[] };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (
    !Array.isArray(body.tag_ids) ||
    body.tag_ids.length === 0 ||
    body.tag_ids.some((t) => typeof t !== "string")
  )
    return badRequest("tag_ids must be a non-empty array of strings");

  const supabase = createServiceClient();

  const { data: tx } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", txId)
    .eq("user_id", req.user.sub)
    .single();

  if (!tx) return notFound("Transaction");

  const { error } = await supabase
    .from("transaction_tags")
    .delete()
    .eq("transaction_id", txId)
    .in("tag_id", body.tag_ids);

  if (error) {
    console.error("[transaction-tags] delete error:", error);
    return serverError("Failed to detach tags");
  }

  return NextResponse.json({ message: "Tags detached" });
});
