import { NextResponse } from "next/server";
import { withAuth, AuthedRequest } from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

export const GET = withAuth(async (req: AuthedRequest) => {
  const supabase = createServiceClient();
  const userId = req.user.sub;

  const [
    { data: transactions },
    { data: categories },
    { data: paymentMethods },
    { data: budgets },
    { data: tags },
  ] = await Promise.all([
    supabase.from("transactions").select("*").eq("user_id", userId),
    supabase.from("categories").select("*").eq("user_id", userId),
    supabase.from("payment_methods").select("*").eq("user_id", userId),
    supabase.from("budgets").select("*").eq("user_id", userId),
    supabase.from("tags").select("*").eq("user_id", userId),
  ]);

  const backup = {
    version: "1.0",
    exported_at: new Date().toISOString(),
    user_id: userId,
    data: {
      transactions: transactions ?? [],
      categories: categories ?? [],
      payment_methods: paymentMethods ?? [],
      budgets: budgets ?? [],
      tags: tags ?? [],
    },
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cashora-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
});
