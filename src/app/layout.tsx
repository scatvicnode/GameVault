import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WalletProviderWrapper } from "@/components/WalletProviderWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ShelbyGameVault — Build & Store Game Assets on Shelby",
  description:
    "Build, upload, and manage game assets on decentralized storage powered by Shelby Protocol on Aptos blockchain. Store sprites, audio, maps, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050510] text-white min-h-screen`}
      >
        <WalletProviderWrapper>{children}</WalletProviderWrapper>
      </body>
    </html>
  );
}
