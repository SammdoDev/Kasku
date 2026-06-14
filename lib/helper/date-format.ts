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

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();

  // normalize ke midnight biar diff akurat
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateMidnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffMs = todayMidnight.getTime() - dateMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays === 2) return "2 hari lalu";
  if (diffDays === 3) return "3 hari lalu";
  if (diffDays <= 6) return `${diffDays} hari lalu`;
  if (diffDays <= 13) return "Minggu lalu";
  if (diffDays <= 27) return `${Math.floor(diffDays / 7)} minggu lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}
