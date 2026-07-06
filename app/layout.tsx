import "./styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unified Inbox",
  description: "Facebook and Instagram unified inbox"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
