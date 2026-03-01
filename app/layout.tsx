import type { Metadata, Viewport } from 'next';
import { PwaClientEnhancements } from './pwa-client-enhancements';
import { ThemeProvider } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aura Notes',
  description: 'Private Knowledge Vault',
  applicationName: 'Aura Notes',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Aura Notes',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/duck_hunt_dog.png', type: 'image/png' }],
    apple: [{ url: '/duck_hunt_dog.png', type: 'image/png' }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f3f7' },
    { media: '(prefers-color-scheme: dark)', color: '#2a2b33' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="brutalist">
          <PwaClientEnhancements />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
