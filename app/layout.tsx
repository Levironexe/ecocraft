import type { Metadata, Viewport } from "next";
import { VT323, Grandstander } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./components/AuthProvider";
import { PixelParticles } from "./components/PixelParticles";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-vt323",
});

const grandstander = Grandstander({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-grandstander",
});

export const metadata: Metadata = {
  title: "Rác Thải Xanh AI — Sáng Tạo Từ Rác",
  description: "Ứng dụng giúp trẻ em biến rác tái chế thành đồ chơi sáng tạo",
  manifest: "/manifest.json",
  icons: {
    icon: '/icons/favicon.svg',
    apple: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rác Thải Xanh AI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2196f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${vt323.variable} ${grandstander.variable}`}>
      <body>
        <Analytics />
        <PixelParticles />
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
