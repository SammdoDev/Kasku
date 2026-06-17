import { NextResponse } from "next/server";
import { withAuth, AuthedRequest } from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

interface BackupData {
  version: string;
  user_id: string;
  data: {
    transactions: Record<string, unknown>[];
    categories: Record<string, unknown>[];
    payment_methods: Record<string, unknown>[];
    budgets: Record<string, unknown>[];
    tags: Record<string, unknown>[];
  };
}

export const POST = withAuth(async (req: AuthedRequest) => {
  let body: BackupData;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "File tidak valid" }, { status: 400 });
  }

  // Validasi struktur
  if (!body.version || !body.data) {
    return NextResponse.json(
      { message: "Format backup tidak valid. Pastikan file dari Cashora." },
      { status: 400 },
    );
  }

  const { data } = body;
  const userId = req.user.sub;
  const supabase = createServiceClient();

  type Results = {
    categories: number;
    payment_methods: number;
    budgets: number;
    tags: number;
    transactions: number;
    errors: string[];
  };

  const results: Results = {
    categories: 0,
    payment_methods: 0,
    budgets: 0,
    tags: 0,
    transactions: 0,
    errors: [],
  };

  // Helper: upsert per tabel, override user_id dengan user yang login
  const upsert = async (
    table: string,
    rows: Record<string, unknown>[],
    key: Exclude<keyof Results, "errors">,
  ) => {
    if (!rows?.length) return;
    const mapped = rows.map((r) => ({ ...r, user_id: userId }));
    const { error, count } = await supabase
      .from(table)
      .upsert(mapped, { onConflict: "id", ignoreDuplicates: false })
      .select("id");
    if (error) {
      results.errors.push(`${table}: ${error.message}`);
    } else {
      results[key] = count ?? mapped.length;
    }
  };

  // Urutan penting: categories & payment_methods dulu sebelum transactions (FK)
  await upsert("categories", data.categories ?? [], "categories");
  await upsert(
    "payment_methods",
    data.payment_methods ?? [],
    "payment_methods",
  );
  await upsert("budgets", data.budgets ?? [], "budgets");
  await upsert("tags", data.tags ?? [], "tags");
  await upsert("transactions", data.transactions ?? [], "transactions");

  const hasErrors = results.errors.length > 0;

  return NextResponse.json(
    {
      message: hasErrors
        ? "Import selesai dengan beberapa error"
        : "Import berhasil",
      results,
    },
    { status: hasErrors ? 207 : 200 },
  );
});
