import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VirtIQ",
  description:
    "An AI-powered platform for interview preparation | Virtual AI interviews, real knowledge",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.variable} antialiased pattern`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
