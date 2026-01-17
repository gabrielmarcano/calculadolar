import './globals.css';
import type { Metadata, Viewport } from 'next';
import SerwistProvider from './SerwistProvider';

export const metadata: Metadata = {
  title: 'Conversion PWA',
  description: 'Simple Calculator',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Conversion',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <SerwistProvider>{children}</SerwistProvider>
      </body>
    </html>
  );
}
