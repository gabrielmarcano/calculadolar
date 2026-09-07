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
            __html: `(function(){try{var v=localStorage.getItem('calculadolar_last_view');document.documentElement.setAttribute('data-initial-view',v==='dashboard'?'dashboard':'calculator');var sat=localStorage.getItem('calculadolar_sat');var sab=localStorage.getItem('calculadolar_sab');if(sat)document.documentElement.style.setProperty('--sat',sat);if(sab)document.documentElement.style.setProperty('--sab',sab)}catch(e){document.documentElement.setAttribute('data-initial-view','calculator')}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--sat:0px;--sab:0px;--safe-area-top:max(var(--sat,0px),env(safe-area-inset-top,0px));--safe-area-bottom:max(var(--sab,0px),env(safe-area-inset-bottom,0px))}html,body{background-color:#0a0a0a!important;color:#fff!important;margin:0;padding:0;height:100%!important}#app-main{padding-top:var(--safe-area-top)!important;padding-bottom:var(--safe-area-bottom)!important}html[data-initial-view="dashboard"] #view-dashboard{display:flex!important;flex:1 1 0%!important;min-height:0!important}html[data-initial-view="dashboard"] #view-calculator{display:none!important}html[data-initial-view="calculator"] #view-dashboard{display:none!important}html[data-initial-view="calculator"] #view-calculator{display:flex!important;flex:1 1 0%!important;min-height:0!important}`,
          }}
        />
        <link rel="preload" as="image" href="/bcv.svg" />
        <link rel="preload" as="image" href="/binance.svg" />
        <link rel="preload" as="image" href="/web-app-manifest-192x192.png" />
      </head>
      <body className="font-sans antialiased">
        <div
          id="safe-area-probe"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: 'env(safe-area-inset-top, 0px)',
            width: 'env(safe-area-inset-bottom, 0px)',
            pointerEvents: 'none',
            visibility: 'hidden',
            zIndex: -1,
          }}
          aria-hidden="true"
        />
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
