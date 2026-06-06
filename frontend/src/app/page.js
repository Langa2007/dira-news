import Link from 'next/link';
import BreakingTicker from '@/components/BreakingTicker';
import StoryCard from '@/components/StoryCard';
import { getHotNews, getPublicFeed } from '@/lib/api';

const categoryLinks = ['Local', 'World', 'Politics', 'Business', 'Technology', 'Sports', 'Health', 'Education'];

function uniqueStories(stories) {
  const seen = new Set();

  return stories.filter((story) => {
    const key = story.id || story.slug;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export default async function Home() {
  const [feed, hotNews] = await Promise.all([getPublicFeed({ limit: 24 }), getHotNews()]);
  const lead = feed[0];
  const secondary = feed.slice(1, 5);
  const latest = feed.slice(5, 13);
  const tickerStories = uniqueStories(feed.filter((story) => story.isBreaking).concat(feed)).slice(0, 5);
  const localRanked = uniqueStories(hotNews.local.concat(feed.filter((story) => story.category === 'LOCAL'))).slice(0, 5);
  const worldRanked = uniqueStories(hotNews.world.concat(feed.filter((story) => story.category === 'WORLD'))).slice(0, 5);

  return (
    <main>
      <BreakingTicker initialStories={tickerStories} />

      <section className="hero-grid">
        <div className="hero-lead">
          {lead ? <StoryCard story={lead} variant="lead" /> : null}
        </div>
        <aside className="editorial-brief">
          <p className="eyebrow">Today on Dira</p>
          <h1>News that starts local and keeps the wider picture in view.</h1>
          <p>
            Follow verified updates, public-service explainers, and developing stories across county desks, national systems, and the world beyond.
          </p>
          <div className="brief-actions">
            <Link className="primary-button" href="/signup">
              Build your feed
            </Link>
            <Link className="secondary-button" href="/categories/local">
              See local news
            </Link>
          </div>
        </aside>
      </section>

      <section className="category-band" aria-label="Browse categories">
        {categoryLinks.map((category) => (
          <Link key={category} href={`/categories/${category.toLowerCase()}`}>
            {category}
          </Link>
        ))}
      </section>

      <section className="content-shell two-column">
        <div>
          <div className="section-heading">
            <p className="eyebrow">Latest</p>
            <h2>Fresh from the desk</h2>
          </div>
          <div className="story-grid">
            {secondary.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
        <aside className="ranked-panel">
          <div className="section-heading compact">
            <p className="eyebrow">Ranked</p>
            <h2>Local heat</h2>
          </div>
          <ol className="ranked-list">
            {localRanked.map((story) => (
              <li key={story.id}>
                <Link href={story.href}>{story.title}</Link>
                <span>{story.region?.name || 'Local Desk'}</span>
              </li>
            ))}
          </ol>
          <div className="section-heading compact world-heading">
            <p className="eyebrow">Context</p>
            <h2>World watch</h2>
          </div>
          <ol className="ranked-list">
            {worldRanked.map((story) => (
              <li key={story.id}>
                <Link href={story.href}>{story.title}</Link>
                <span>{story.region?.name || 'World Desk'}</span>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="content-shell">
        <div className="section-heading">
          <p className="eyebrow">More stories</p>
          <h2>Across categories</h2>
        </div>
        <div className="wide-story-list">
          {latest.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>
    </main>
  );
}
