import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vanyuming2.github.io"),
  title: "万雨铭 & 张锦｜我们的纪念日",
  description:
    "从 2026 年 4 月 29 日 00:17 开始，记录万雨铭与张锦一起走过的每一天。",
  openGraph: {
    title: "万雨铭 & 张锦｜我们的纪念日",
    description: "从那一刻起，时间有了温度。",
    type: "website",
    locale: "zh_CN",
    url: "https://vanyuming2.github.io",
    images: [
      {
        url: "/og.png",
        width: 1744,
        height: 904,
        alt: "万雨铭与张锦的纪念日",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "万雨铭 & 张锦｜我们的纪念日",
    description: "从那一刻起，时间有了温度。",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f5f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
