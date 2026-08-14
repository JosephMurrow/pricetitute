import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND } from "@/components/Brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: BRAND,
  description: "Угадай, за какую сумму человек согласился бы это сделать.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /**
   * Экранная клавиатура на телефоне уменьшает саму раскладку, а не наезжает
   * на неё. Без этого поле ввода чата уезжает под клавиатуру, а вёрстка,
   * завязанная на высоту экрана, дёргается при каждом нажатии.
   */
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
