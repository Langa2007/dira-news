import Link from 'next/link';
import Image from 'next/image';

function formatDate(date) {
  if (!date) {
    return 'Developing';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(date));
}

export default function StoryCard({ story, variant = 'standard' }) {
  const isLead = variant === 'lead';

  return (
    <article className={`story-card ${isLead ? 'lead-card' : ''}`}>
      <Link className="story-image-link" href={story.href} aria-label={story.title}>
        <Image
          className="story-image"
          src={story.imageUrl}
          alt={story.imageAlt}
          width={900}
          height={560}
          priority={isLead}
          unoptimized
        />
      </Link>
      <div className="story-body">
        <div className="story-meta">
          <span className={story.isBreaking ? 'label label-red' : 'label'}>{story.isBreaking ? 'Breaking' : story.category}</span>
          <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
        </div>
        <h2 className={isLead ? 'lead-title' : 'story-title'}>
          <Link href={story.href}>{story.title}</Link>
        </h2>
        <p>{story.subtitle || story.summary}</p>
        <div className="story-footer">
          <span>{story.region?.name || 'Dira Desk'}</span>
          <span>{story.topics?.[0]?.name || 'News'}</span>
        </div>
      </div>
    </article>
  );
}
