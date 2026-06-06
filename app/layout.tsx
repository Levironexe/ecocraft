import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import { PixelParticles } from "./components/PixelParticles";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "EcoCraft AI — Sáng Tạo Từ Rác",
  description: "Ứng dụng giúp trẻ em biến rác tái chế thành đồ chơi sáng tạo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={vt323.variable}>
      <body className={vt323.className}>
        <PixelParticles />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
