import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  FileText,
  Tag,
  CalendarRange,
  Target,
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
      {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        label: "Kategori",
        href: "/kategori",
        icon: Tag,
      },
      {
        label: "Transaksi",
        href: "/transaksi",
        icon: ArrowLeftRight,
      },
      {
        label: "Laporan",
        href: "/laporan",
        icon: FileText,
      },
    ],
  },
  {
    title: "KELOLA",
    items: [
      {
        label: "Kategori",
        href: "/kategori",
        icon: Tag,
      },
      {
        label: "Anggaran",
        href: "/anggaran",
        icon: CalendarRange,
        badge: 1,
      },
      {
        label: "Tujuan",
        href: "/tujuan",
        icon: Target,
      },
    ],
  },
];

export const NAV_BOTTOM: NavItem[] = [
  {
    label: "Bantuan",
    href: "/bantuan",
    icon: HelpCircle,
  },
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
