import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vanyuming2.github.io"),
  title: "万雨铭与张锦｜两个人的小站",
  description:
    "万雨铭与张锦的日常主页，记录从 2007 年相识到现在的几件小事。",
  openGraph: {
    title: "万雨铭与张锦｜两个人的小站",
    description: "这里只记我们想记的。",
    type: "website",
    locale: "zh_CN",
    url: "https://vanyuming2.github.io",
    images: [
      {
        url: "/og.png",
        width: 1744,
        height: 904,
        alt: "万雨铭与张锦的两人主页",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "万雨铭与张锦｜两个人的小站",
    description: "这里只记我们想记的。",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#151514",
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
