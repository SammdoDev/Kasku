// src/app/api/payment-methods/route.ts

import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

const VALID_TYPES = ["bank", "ewallet", "cash", "credit", "other"];

/**
 * icon field menyimpan nama icon dari Lucide React
 * contoh: "Wallet", "CreditCard", "Building2", "Smartphone"
 */

// GET /api/payment-methods
export const GET = withAuth(async (req: AuthedRequest) => {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .select("id, name, type, icon, balance, created_at, updated_at")
    .eq("user_id", req.user.sub)
    .order("type")
    .order("name");

  if (error) {
    console.error("[payment-methods] get error:", error);
    return serverError();
  }

  return NextResponse.json({ payment_methods: data });
});

// POST /api/payment-methods
// Body: { name, type?, icon? }
// icon: nama Lucide icon (e.g. "Wallet", "CreditCard", "Building2")
export const POST = withAuth(async (req: AuthedRequest) => {
  let body: { name?: string; type?: string; icon?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { name, type, icon } = body;

  if (!name || name.trim().length < 1) return badRequest("name is required");
  if (type && !VALID_TYPES.includes(type)) {
    return badRequest(`type must be one of: ${VALID_TYPES.join(", ")}`);
  }

  if (icon !== undefined && icon !== null) {
    if (typeof icon !== "string" || !/^[A-Za-z0-9]+$/.test(icon)) {
      return badRequest(
        "icon must be a Lucide icon name (e.g. 'Wallet', 'CreditCard'). See https://lucide.dev/icons",
      );
    }
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      user_id: req.user.sub,
      name: name.trim(),
      type: type ?? null,
      icon: icon ?? null,
    })
    .select("id, name, type, icon, balance, created_at")
    .single();

  if (error) {
    console.error("[payment-methods] insert error:", error);
    return serverError("Failed to create payment method");
  }

  return NextResponse.json({ payment_method: data }, { status: 201 });
});
