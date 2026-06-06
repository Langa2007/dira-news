import { Fraunces, Source_Sans_3 } from 'next/font/google';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import PreferencePrompt from '@/components/PreferencePrompt';
import './globals.css';

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800']
});

const sourceSans = Source_Sans_3({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata = {
  title: 'Dira News',
  description: 'Local facts, wider context, and public-interest reporting from Dira News.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSans.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div>
            <strong>Dira News</strong>
            <p>Independent reporting, source-aware publishing, and a sharper public record.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/categories/local">Local</Link>
            <Link href="/categories/world">World</Link>
            <a href="/rss.xml">RSS</a>
            <a href="/sitemap.xml">Sitemap</a>
          </nav>
        </footer>
        <PreferencePrompt />
      </body>
    </html>
  );
}
