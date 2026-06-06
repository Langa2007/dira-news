import Link from 'next/link';
import StoryCard from '@/components/StoryCard';
import { getPublicFeed } from '@/lib/api';

const categoryNames = {
  local: 'LOCAL',
  world: 'WORLD',
  politics: 'POLITICS',
  business: 'BUSINESS',
  technology: 'TECHNOLOGY',
  sports: 'SPORTS',
  health: 'HEALTH',
  education: 'EDUCATION',
  entertainment: 'ENTERTAINMENT',
  opinion: 'OPINION'
};

export async function generateMetadata({ params }) {
  const { category: categoryParam } = await params;
  const category = categoryNames[categoryParam] || categoryParam.toUpperCase();

  return {
    title: `${category} - Dira News`,
    description: `Latest ${category.toLowerCase()} reporting from Dira News.`
  };
}

export default async function CategoryPage({ params }) {
  const { category: categoryParam } = await params;
  const category = categoryNames[categoryParam] || categoryParam.toUpperCase();
  const stories = await getPublicFeed({ category, limit: 40 });

  return (
    <main className="page-shell">
      <section className="category-hero">
        <p className="eyebrow">Category</p>
        <h1>{category.toLowerCase()}</h1>
        <p>Follow the latest verified reporting, updates, and context from the {category.toLowerCase()} desk.</p>
      </section>

      {stories.length ? (
        <div className="story-grid category-grid">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>No published stories yet</h2>
          <p>This section will fill as editors publish approved stories from the backend.</p>
          <Link className="secondary-button" href="/">
            Return home
          </Link>
        </section>
      )}
    </main>
  );
}
