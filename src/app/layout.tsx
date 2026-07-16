import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Furqon AI — Islomiy Bilimlar Yordamchisi",
  description:
    "Furqon AI — Qur'on va Hadis asosida savollarga javob beruvchi sun'iy intellekt yordamchisi.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
