import type { Metadata } from "next";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { WalletProvider } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "FOMODEX - Professional Solana Trading Terminal",
  description: "Professional Solana DEX with real-time charts, token swapping via Jupiter, and admin token listing. Launching at Meteora.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#050508]">
        <WalletProvider>
          {children}
        </WalletProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
