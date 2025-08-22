
import type { Metadata } from "next";
import { Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider"; // ← Utiliser notre composant
import { titlesFont } from "@/app/fonts/pulse";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulse - Gestion d'événements",
  description: "Plateforme de gestion d'événements et d'artistes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${bricolage.variable} ${geistMono.variable} ${titlesFont.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
