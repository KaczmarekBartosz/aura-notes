import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aura Notes',
  description: 'Private Knowledge Vault',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
