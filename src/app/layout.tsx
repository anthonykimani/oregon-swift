import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

/**
 * Single application/body family. Marketing headlines use the locally hosted
 * Clash Display face (see globals.css). Legacy `font-inter`, `font-dm-sans`,
 * etc. are aliased to Manrope in globals.css so no screen needs a rewrite.
 *
 * The variable is deliberately named `--font-manrope-source` so the
 * `--font-manrope` token in globals.css can alias it without resolving to
 * itself.
 */
const manrope = Manrope({
  variable: "--font-manrope-source",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oregon Swift Deliveries — Connecting the PNW with Speed, Precision & Trust",
  description:
    "Portland-based logistics and last-mile delivery company specializing in reliable, time-sensitive transportation solutions across the Pacific Northwest and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
