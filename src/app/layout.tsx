import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { LenisProvider } from "@/components/public/LenisProvider";
import { Inter, Outfit } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

function getSafeMetadataBase(): URL {
  try {
    const raw = siteConfig.url;
    if (raw && (raw.startsWith("http://") || raw.startsWith("https://"))) {
      return new URL(raw);
    }
  } catch {}
  return new URL("https://cbitphotoclub.vercel.app");
}

export const metadata: Metadata = {
  metadataBase: getSafeMetadataBase(),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: [
      { url: "/images/logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans bg-[#050208]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <QueryProvider>
            <LenisProvider>
              {/* "user" respects prefers-reduced-motion automatically across every Framer Motion component in the tree */}
              <MotionConfig reducedMotion="user">
                <div className="relative z-10">{children}</div>
              </MotionConfig>
            </LenisProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
