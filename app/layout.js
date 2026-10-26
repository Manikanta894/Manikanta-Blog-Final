import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'INSIGHTS',
      url: SITE_URL,
      description: 'A premium digital publication on artificial intelligence, business, and the future of work.',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg`, width: 512, height: 512 },
      sameAs: [],
      founder: { '@type': 'Person', name: 'Manikanta', url: `${SITE_URL}/author` },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'INSIGHTS',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'INSIGHTS — Ideas. Intelligence. Impact.', template: '%s — INSIGHTS' },
  description:
    'A premium digital publication on artificial intelligence, business, analytics, career, technology, and leadership.',
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'INSIGHTS',
    description: 'Ideas. Intelligence. Impact.',
    type: 'website',
    url: SITE_URL,
    siteName: 'INSIGHTS',
  },
  twitter: { card: 'summary_large_image', title: 'INSIGHTS', description: 'Ideas. Intelligence. Impact.' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <body className="font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
