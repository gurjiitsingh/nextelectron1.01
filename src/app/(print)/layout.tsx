export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="bg-white">
        {children}
      </body>
    </html>
  );
}