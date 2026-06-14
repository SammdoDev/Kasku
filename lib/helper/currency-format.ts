export default function formatIDR(value: unknown): string {
  const n = Number(value ?? 0);
  if (isNaN(n)) return "Rp 0";
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}
