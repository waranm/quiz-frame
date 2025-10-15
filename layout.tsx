export const metadata = {
  title: "Quiz Frame",
  description: "Farcaster quiz frame demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", margin: 0, padding: 16 }}>{children}</body>
    </html>
  );
}
