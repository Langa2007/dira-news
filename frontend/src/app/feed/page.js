import PersonalizedFeed from '@/components/PersonalizedFeed';

export const metadata = {
  title: 'Personal feed - Dira News'
};

export default function FeedPage() {
  return (
    <main className="page-shell">
      <section className="category-hero">
        <p className="eyebrow">Personal feed</p>
        <h1>Your Dira</h1>
        <p>Stories ranked by your preferences, reading signals, local relevance, and editorial hotness scores.</p>
      </section>
      <PersonalizedFeed />
    </main>
  );
}
