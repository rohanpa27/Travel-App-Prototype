import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Figtree } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";
import { Providers } from "@/components/ui/Providers";

const display = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["600", "700", "800"] });
const sans = Figtree({ variable: "--font-figtree", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: brand.documentTitle,
  description: brand.promise,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6f7fc" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
