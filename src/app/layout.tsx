import type { Metadata, Viewport } from "next";
import { Phetsarath } from "next/font/google";
import { LanguageProvider } from "@/i18n/LanguageContext";
import "./globals.css";

const phetsarath = Phetsarath({
  weight: ["400", "700"],
  subsets: ["lao"],
  variable: "--font-phetsarath",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ຕິດຕາມສະຖານີນໍ້າມັນລາວ",
  description: "ແຜນທີ່ສະຖານີນໍ້າມັນແບບສົດໆ - ຕິດຕາມສະຖານີນໍ້າມັນໃກ້ທ່ານ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fuel Tracker",
  },
  icons: {
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lo"
      className={`${phetsarath.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col font-phetsarath overflow-x-hidden selection:bg-green-100 selection:text-green-900"
        suppressHydrationWarning
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
