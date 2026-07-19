import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oracle Fusion Learning Compliance Manager",
  description:
    "A manager-facing React console for Oracle Fusion HCM Learning compliance queries, agent findings, citations, and course recommendations.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
