// src/app/api/auth/cycle-start/route.ts

import { NextResponse } from "next/server";
import {
  withAuth,
  AuthedRequest,
  badRequest,
  serverError,
} from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

export const PATCH = withAuth(async (req: AuthedRequest) => {
  let body: { cycle_start_date?: number };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { cycle_start_date } = body;

  if (cycle_start_date === undefined) {
    return badRequest("cycle_start_date is required");
  }

  if (
    !Number.isInteger(cycle_start_date) ||
    cycle_start_date < 1 ||
    cycle_start_date > 28
  ) {
    return badRequest("cycle_start_date must be an integer between 1 and 28");
  }

  const supabase = createServiceClient();

  const { data: user, error } = await supabase
    .from("users")
    .update({ cycle_start_date })
    .eq("id", req.user.sub)
    .select("cycle_start_date")
    .single();

  if (error || !user) {
    return serverError("Failed to update cycle start date");
  }

  return NextResponse.json({ user });
});
