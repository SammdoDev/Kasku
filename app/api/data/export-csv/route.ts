import { NextResponse } from "next/server";
import { withAuth, AuthedRequest } from "@/lib/helper/auth";
import { createServiceClient } from "@/lib/supabase/client";

export const GET = withAuth(async (req: AuthedRequest) => {
  const supabase = createServiceClient();
  const userId = req.user.sub;

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(
      `id, type, amount, note, date,
       category:categories(name),
       payment_method:payment_methods(name)`,
    )
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 },
    );
  }

  const header = [
    "ID",
    "Tanggal",
    "Tipe",
    "Jumlah",
    "Catatan",
    "Kategori",
    "Metode Bayar",
  ];

  const rows = (transactions ?? []).map((t) => [
    t.id,
    t.date,
    t.type,
    t.amount,
    t.note ?? "",
    (t.category as unknown as { name: string } | null)?.name ?? "",
    (t.payment_method as unknown as { name: string } | null)?.name ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cashora-transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});
