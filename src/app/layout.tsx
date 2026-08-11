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
      <html lang="en" translate="no" className="overflow-hidden">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Days+One&family=Dosis&family=Quicksand&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Dosis:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className={`${lato.className} bg-white text-[#2b2b2b]`} suppressHydrationWarning>
      {children}</body>
    </html>
  );
}