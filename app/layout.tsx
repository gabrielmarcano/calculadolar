import './globals.css';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import SerwistProvider from './SerwistProvider';

export const metadata: Metadata = {
  title: 'Calculadolar',
  description: 'Calculadora de Dolar',
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
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" dir="ltr" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var v=localStorage.getItem('calculadolar_last_view');document.documentElement.setAttribute('data-initial-view',v==='dashboard'?'dashboard':'calculator')}catch(e){document.documentElement.setAttribute('data-initial-view','calculator')}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html,body{background-color:#0a0a0a!important;color:#fff!important;margin:0;padding:0}html[data-initial-view="dashboard"] #view-dashboard{display:flex!important}html[data-initial-view="dashboard"] #view-calculator{display:none!important}html[data-initial-view="calculator"] #view-dashboard{display:none!important}html[data-initial-view="calculator"] #view-calculator{display:flex!important}`,
          }}
        />
        <link rel="preload" as="image" href="/bcv.svg" />
        <link rel="preload" as="image" href="/binance.svg" />
        <link rel="preload" as="image" href="/web-app-manifest-192x192.png" />
      </head>
      <body className="font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('contextmenu',function(e){e.preventDefault()})`,
          }}
        />
        <SerwistProvider>{children}</SerwistProvider>
      </body>
    </html>
  );
}
