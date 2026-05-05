import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "المؤسسة الاستهلاكية العسكرية",
  description: "منصة المؤسسة الاستهلاكية العسكرية — المملكة الأردنية الهاشمية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
