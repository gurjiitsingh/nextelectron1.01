import "@/app/globals.css";
 
import { Lato } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {



 
  return (
      <html lang="en" translate="no" className="overflow-hidden ">
      <head>
     
      </head>

      <body className={`${lato.className} bg-white text-[#2b2b2b]`} suppressHydrationWarning>
      {children}</body>
    </html>
  );
}