// src/app/api/payment-methods/[id]/route.ts

import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  notFound,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

type Ctx = {
  params: Record<string, string>;
};

const VALID_TYPES = ["bank", "ewallet", "cash", "credit", "other"];

// GET /api/payment-methods/[id]
export const GET = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .select("id, name, type, icon, created_at, updated_at")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (error || !data) return notFound("Payment method");

  return NextResponse.json({ payment_method: data });
});

// PATCH /api/payment-methods/[id]
// icon: nama Lucide icon (e.g. "Wallet", "CreditCard")
export const PATCH = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  let body: { name?: string; type?: string; icon?: string | null };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (body.type && !VALID_TYPES.includes(body.type)) {
    return badRequest(`type must be one of: ${VALID_TYPES.join(", ")}`);
  }

  if (body.icon !== undefined && body.icon !== null) {
    if (typeof body.icon !== "string" || !/^[A-Za-z0-9]+$/.test(body.icon)) {
      return badRequest(
        "icon must be a Lucide icon name (e.g. 'Wallet', 'CreditCard'). See https://lucide.dev/icons",
      );
    }
  }

  const updates: Record<string, unknown> = {};
  if ("name" in body) {
    if (!body.name?.trim()) return badRequest("name cannot be empty");
    updates.name = body.name.trim();
  }
  if ("type" in body) updates.type = body.type;
  if ("icon" in body) updates.icon = body.icon;

  if (Object.keys(updates).length === 0)
    return badRequest("No valid fields to update");

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Payment method");

  const { data, error } = await supabase
    .from("payment_methods")
    .update(updates)
    .eq("id", params.id)
    .select("id, name, type, icon, updated_at")
    .single();

  if (error) {
    console.error("[payment-methods] update error:", error);
    return serverError("Failed to update payment method");
  }

  return NextResponse.json({ payment_method: data });
});

// DELETE /api/payment-methods/[id]
export const DELETE = withAuth(async (req: AuthedRequest, { params }: Ctx) => {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", req.user.sub)
    .single();

  if (!existing) return notFound("Payment method");

  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", params.id);

  if (error) {
    console.error("[payment-methods] delete error:", error);
    return serverError("Failed to delete payment method");
  }

  return NextResponse.json({ message: "Payment method deleted" });
});
