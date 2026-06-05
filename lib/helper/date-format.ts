export default function buildMonthOptions() {
  const opts: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
    opts.push({ key, label });
  }
  return opts;
}

export function dateDisplay(date: string | Date) {
  return new Date(date)
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .toUpperCase();
}
