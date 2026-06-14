import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  FileText,
  CalendarRange,
  Tag,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "UTAMA",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Transaksi", href: "/transaksi", icon: ArrowLeftRight },
      { label: "Kategori", href: "/kategori", icon: FileText },
    ],
  },
  {
    title: "KELOLA",
    items: [
      { label: "Dompet", href: "/dompet", icon: Wallet },
      { label: "Anggaran", href: "/anggaran", icon: CalendarRange, badge: 1 },
      { label: "Tag", href: "/tag", icon: Tag },
      // { label: "Ringkasan", href: "/ringkasan", icon: Tag },
    ],
  },
];

export const NAV_BOTTOM: NavItem[] = [
  { label: "Bantuan", href: "/bantuan", icon: HelpCircle },
];

export const SIDEBAR_CONFIG = {
  appName: "Cashora",
  sidebarWidth: "220px",
  accentColor: "#F5C518",
  bgColor: "#F5F0E8",
} as const;

export const NAVBAR_CONFIG = {
  showNotificationDot: true,
  notificationCount: 4,
} as const;

export const QUICK_ACCESS_ITEMS: NavItem[] = Array.from(
  new Map(
    NAV_GROUPS.flatMap((g) => g.items).map((item) => [item.href, item]),
  ).values(),
).slice(0, 5);
