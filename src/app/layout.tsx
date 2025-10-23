import Script from 'next/script';

export const metadata = {
  title: 'Shorts Challenge Kit',
  description: 'Camera AR overlay & OG card generator for shorts challenges',
  themeColor: '#ff5078'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
