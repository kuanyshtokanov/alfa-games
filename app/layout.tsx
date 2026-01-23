import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alfa Games - Football Game Management",
  description: "Manage and discover football games",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
        <Script
          src="https://widget.tiptoppay.kz/bundles/widget.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
