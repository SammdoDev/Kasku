import { NextResponse } from "next/server";
import { withAuth, AuthedRequest, serverError } from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

type CategoryRow = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export const GET = withAuth(async (req: AuthedRequest) => {
  const { searchParams } = new URL(req.url);

  const monthParam = searchParams.get("month");
  const now = new Date();
  const year = monthParam
    ? parseInt(monthParam.split("-")[0])
    : now.getFullYear();
  const month = monthParam
    ? parseInt(monthParam.split("-")[1])
    : now.getMonth() + 1;

  const dateFrom = `${year}-${String(month).padStart(2, "0")}-01`;
  const dateTo = new Date(year, month, 0).toISOString().split("T")[0];

  const supabase = createServiceClient();
  const userId = req.user.sub;

  const { data: monthlyTxns, error: monthlyError } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", userId)
    .gte("date", dateFrom)
    .lte("date", dateTo);

  if (monthlyError) {
    console.error("[dashboard] monthly totals error:", monthlyError);
    return serverError();
  }

  const totalIncome = (monthlyTxns ?? [])
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = (monthlyTxns ?? [])
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // ── 2. All-time balance ───────────────────────────────────
  const { data: allTxns } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", userId);

  const balance =
    (allTxns ?? [])
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) -
    (allTxns ?? [])
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

  // ── 3. Spending by category ───────────────────────────────
  const { data: byCategoryRaw } = await supabase
    .from("transactions")
    .select("amount, category:categories(id, name, icon, color)")
    .eq("user_id", userId)
    .eq("type", "expense")
    .gte("date", dateFrom)
    .lte("date", dateTo);

  const categoryMap: Record<string, CategoryRow & { total: number }> = {};

  for (const txn of byCategoryRaw ?? []) {
    // Supabase returns joined row as array when using !inner — cast safely
    const rawCat = txn.category;
    const cat: CategoryRow | null = Array.isArray(rawCat)
      ? ((rawCat[0] as CategoryRow) ?? null)
      : ((rawCat as CategoryRow) ?? null);

    const key = cat?.id ?? "uncategorized";
    if (!categoryMap[key]) {
      categoryMap[key] = {
        id: cat?.id ?? "uncategorized",
        name: cat?.name ?? "Uncategorized",
        icon: cat?.icon ?? null,
        color: cat?.color ?? null,
        total: 0,
      };
    }
    categoryMap[key].total += Number(txn.amount);
  }

  const spendingByCategory = Object.values(categoryMap)
    .sort((a, b) => b.total - a.total)
    .map((c) => ({
      ...c,
      percent:
        totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0,
    }));

  // ── 4. Daily trend ────────────────────────────────────────
  const { data: dailyTxns } = await supabase
    .from("transactions")
    .select("type, amount, date")
    .eq("user_id", userId)
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date");

  const dailyMap: Record<string, { income: number; expense: number }> = {};
  for (const txn of dailyTxns ?? []) {
    if (!dailyMap[txn.date]) dailyMap[txn.date] = { income: 0, expense: 0 };
    dailyMap[txn.date][txn.type as "income" | "expense"] += Number(txn.amount);
  }

  const dailyTrend = Object.entries(dailyMap).map(([date, v]) => ({
    date,
    income: v.income,
    expense: v.expense,
    net: v.income - v.expense,
  }));

  // ── 5. Last 6 months trend ────────────────────────────────
  const sixMonthsAgo = new Date(year, month - 7, 1).toISOString().split("T")[0];

  const { data: trendTxns } = await supabase
    .from("transactions")
    .select("type, amount, date")
    .eq("user_id", userId)
    .gte("date", sixMonthsAgo)
    .lte("date", dateTo);

  const monthlyMap: Record<string, { income: number; expense: number }> = {};
  for (const txn of trendTxns ?? []) {
    const key = txn.date.slice(0, 7);
    if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
    monthlyMap[key][txn.type as "income" | "expense"] += Number(txn.amount);
  }

  const monthlyTrend = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([m, v]) => ({
      month: m,
      income: v.income,
      expense: v.expense,
      net: v.income - v.expense,
    }));

  // ── 6. Budget summary ─────────────────────────────────────
  const { data: budgets } = await supabase
    .from("budgets")
    .select("id, name, amount, period, category_id")
    .eq("user_id", userId)
    .or(`end_date.is.null,end_date.gte.${dateFrom}`);

  const budgetSummary = await Promise.all(
    (budgets ?? []).map(async (b) => {
      let q = supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "expense")
        .gte("date", dateFrom)
        .lte("date", dateTo);

      if (b.category_id) q = q.eq("category_id", b.category_id);

      const { data: spend } = await q;
      const spent = (spend ?? []).reduce((s, t) => s + Number(t.amount), 0);
      const percent = Math.min(
        100,
        Math.round((spent / Number(b.amount)) * 100),
      );

      return {
        id: b.id,
        name: b.name,
        amount: Number(b.amount),
        spent,
        remaining: Number(b.amount) - spent,
        percent_used: percent,
        over_budget: spent > Number(b.amount),
      };
    }),
  );

  // ── 7. Recent transactions ────────────────────────────────
  const { data: recentTxns } = await supabase
    .from("transactions")
    .select(
      `
      id, type, amount, note, date,
      category:categories(id, name, icon, color),
      payment_method:payment_methods(id, name, icon)
    `,
    )
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    period: { year, month, date_from: dateFrom, date_to: dateTo },
    summary: {
      balance,
      total_income: totalIncome,
      total_expense: totalExpense,
      net: totalIncome - totalExpense,
    },
    spending_by_category: spendingByCategory,
    daily_trend: dailyTrend,
    monthly_trend: monthlyTrend,
    budget_summary: budgetSummary,
    recent_transactions: recentTxns ?? [],
  });
});
