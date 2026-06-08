import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import "./globals.css";

import AppShell from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Cashora App",
  description:
    "Aplikasi pencatatan keuangan untuk mengatur pemasukan dan pengeluaran secara praktis.",
  icons: {
    icon: "/logo-wallet.png",
    apple: "/icon-192.png",
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
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <AppShell>{children}</AppShell>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
