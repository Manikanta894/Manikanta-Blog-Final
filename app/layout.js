import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

// Matches the portfolio's display/body/mono stack exactly (Instrument Serif +
// Inter Tight + JetBrains Mono) so the blog reads as the same brand.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'INSIGHTS — Ideas. Intelligence. Impact.', template: '%s — INSIGHTS' },
  description:
    'A premium digital publication on artificial intelligence, business, analytics, career, technology, and leadership.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'INSIGHTS',
    description: 'Ideas. Intelligence. Impact.',
    type: 'website',
    url: SITE_URL,
    siteName: 'INSIGHTS',
  },
  twitter: { card: 'summary_large_image', title: 'INSIGHTS', description: 'Ideas. Intelligence. Impact.' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  // Add your Google Search Console verification code here once you register the property:
  // verification: { google: 'YOUR_VERIFICATION_CODE' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${interTight.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
