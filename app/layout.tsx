import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadRadius AI — Local Business Lead Intelligence",
  description:
    "Discover high-quality local business leads within any radius using AI-powered scoring and Google Places data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
