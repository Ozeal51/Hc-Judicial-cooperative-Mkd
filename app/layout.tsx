import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JTLCS Portal | Judicial Staff Thrift & Loans Cooperative Society",
  description: "A cooperative member, savings and loan management portal prototype for the Judicial Staff Thrift & Loans Cooperative Society, Makurdi.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b2545" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
