import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPublicFeed, getStoryBySlug } from '@/lib/api';

function formatDate(date) {
  if (!date) {
    return 'Developing';
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(date));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return {
      title: 'Story not found - Dira News'
    };
  }

  return {
    title: `${story.title} - Dira News`,
    description: story.summary || story.subtitle
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const related = (await getPublicFeed({ category: story.category, limit: 4 })).filter((item) => item.slug !== story.slug);

  return (
    <main className="article-shell">
      <article className="article-layout">
        <header className="article-header">
          <div className="story-meta">
            <span className={story.isBreaking ? 'label label-red' : 'label'}>{story.isBreaking ? 'Breaking' : story.category}</span>
            <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
          </div>
          <h1>{story.title}</h1>
          <p>{story.subtitle || story.summary}</p>
          <div className="article-byline">
            <span>{story.region?.name || 'Dira Newsroom'}</span>
            <span>{story.topics?.map((topic) => topic.name).join(', ') || 'Public interest'}</span>
          </div>
        </header>
        <figure className="article-media">
          <Image src={story.imageUrl} alt={story.imageAlt} width={1100} height={690} priority unoptimized />
        </figure>
        <div className="article-body">
          <p>{story.summary || story.subtitle}</p>
          <p>
            This public page is connected to the Dira publishing feed. As the editorial backend adds richer story bodies, source evidence, media, and
            corrections, this article view will expand around that verified source of truth.
          </p>
          <p>
            Dira keeps the article readable first: what happened, why it matters, where the evidence comes from, and what remains developing.
          </p>
        </div>
      </article>

      <aside className="related-panel">
        <p className="eyebrow">More in {story.category}</p>
        <h2>Related reading</h2>
        {related.map((item) => (
          <Link key={item.id} href={item.href}>
            {item.title}
          </Link>
        ))}
      </aside>
    </main>
  );
}
