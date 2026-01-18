import './globals.css';
import type { Metadata, Viewport } from 'next';
import SerwistProvider from './SerwistProvider';

export const metadata: Metadata = {
  title: 'Calculadolar',
  description: 'Calculadora de Dolar',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Calculadolar',
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
