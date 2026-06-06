import Link from 'next/link';
import { Search, UserRound } from 'lucide-react';

const navItems = [
  ['Local', '/categories/local'],
  ['World', '/categories/world'],
  ['Politics', '/categories/politics'],
  ['Business', '/categories/business'],
  ['Health', '/categories/health'],
  ['Education', '/categories/education']
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="top-strip">
        <p>Independent public-interest reporting</p>
        <nav aria-label="Utility navigation">
          <Link href="/login">Login</Link>
          <Link href="/signup">Create account</Link>
        </nav>
      </div>
      <div className="brand-row">
        <Link className="brand-lockup" href="/" aria-label="Dira News home">
          <span className="brand-mark">D</span>
          <span>
            <strong>Dira News</strong>
            <small>Local facts. Wider context.</small>
          </span>
        </Link>
        <form className="search-box" action="/search">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="site-search">
            Search Dira News
          </label>
          <input id="site-search" name="q" type="search" placeholder="Search stories, places, topics" />
        </form>
        <Link className="account-button" href="/feed">
          <UserRound size={18} aria-hidden="true" />
          <span>Personal feed</span>
        </Link>
      </div>
      <nav className="section-nav" aria-label="News categories">
        {navItems.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
