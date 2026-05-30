import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import "./globals.css";

import AppShell from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "KasKu App",
  description:
    "Aplikasi pencatatan keuangan untuk mengatur pemasukan dan pengeluaran secara praktis.",
  icons: {
    icon: "/logo-wallet.png",
  },
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
