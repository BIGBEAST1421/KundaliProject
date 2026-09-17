import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kundali",
  description: "Vedic birth charts and compatibility, explained simply.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
