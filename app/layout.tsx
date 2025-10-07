import I18nProvider from '@/components/I18nProvider';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "公益慈善活动截止日期",
  description: "追踪公益慈善会议、竞赛和活动重要截止日期的网站，帮助公益从业者、志愿者和爱心人士及时了解最新的公益慈善活动动态，不再错过参与公益事业、奉献爱心和社会服务的机会。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://umami.rkd.icu/script.js" data-website-id="78225323-cc05-46af-9a51-6c670b9a804a"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
