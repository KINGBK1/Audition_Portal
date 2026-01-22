import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/app/storeProvider";
import { ThemeProvider } from "@/components/theme-provider";
import DisableDevTools from "@/components/DisableDevTools";
import SecurityLayer from "@/components/securitylayer";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GLUG Auditions",
  description: "May the Source Be With You",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <ThemeProvider>
            <DisableDevTools />
            <SecurityLayer />
            {children}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}