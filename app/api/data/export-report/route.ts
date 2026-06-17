import { NextResponse } from "next/server";
import { withAuth, AuthedRequest } from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

export const GET = withAuth(async (req: AuthedRequest) => {
  const supabase = createServiceClient();
  const userId = req.user.sub;

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // format: YYYY-MM, opsional

  let query = supabase
    .from("transactions")
    .select(
      `id, type, amount, note, date,
       category:categories(name, color),
       payment_method:payment_methods(name)`,
    )
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (month) {
    const [y, m] = month.split("-");
    const from = `${y}-${m}-01`;
    const to = new Date(Number(y), Number(m), 0).toISOString().slice(0, 10);
    query = query.gte("date", from).lte("date", to);
  }

  const { data: transactions, error } = await query;

  if (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 },
    );
  }

  const totalIncome = (transactions ?? [])
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = (transactions ?? [])
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const report = {
    generated_at: new Date().toISOString(),
    period: month ?? "all",
    summary: {
      total_income: totalIncome,
      total_expense: totalExpense,
      net: totalIncome - totalExpense,
      total_transactions: (transactions ?? []).length,
    },
    transactions: transactions ?? [],
  };

  return new NextResponse(JSON.stringify(report, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cashora-report-${month ?? "all"}-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
});
