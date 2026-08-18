import "@/app/globals.css";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      translate="no"
      className="overflow-hidden"
    >
      <head />

      <body
        className={`${inter.className} bg-white text-[#2b2b2b]`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}