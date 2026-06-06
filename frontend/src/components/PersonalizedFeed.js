'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export default function PersonalizedFeed() {
  const [state, setState] = useState({ status: 'loading', feed: [], message: '' });

  useEffect(() => {
    const token = window.localStorage.getItem('dira-access-token');

    if (!token) {
      window.setTimeout(() => {
        setState({
          status: 'signed-out',
          feed: [],
          message: 'Login or create an account to unlock your personalized feed.'
        });
      }, 0);
      return;
    }

    fetch(`${API_BASE_URL}/recommendations/me/feed?limit=24`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Could not load personalized feed');
        }

        setState({ status: 'ready', feed: data.feed || [], message: data.explanation || '' });
      })
      .catch((error) => {
        setState({ status: 'error', feed: [], message: error.message });
      });
  }, []);

  if (state.status === 'loading') {
    return <p className="feed-status">Loading your feed...</p>;
  }

  if (state.status !== 'ready') {
    return (
      <div className="empty-state">
        <h2>Personalization is waiting</h2>
        <p>{state.message}</p>
        <Link className="primary-button" href="/login">
          Login
        </Link>
      </div>
    );
  }

  return (
    <section>
      <p className="feed-status">{state.message}</p>
      <div className="personal-feed-list">
        {state.feed.map((story) => (
          <article key={story.id} className="personal-feed-item">
            <span className={story.isBreaking ? 'label label-red' : 'label'}>{story.isBreaking ? 'Breaking' : story.category}</span>
            <h2>
              <Link href={`/articles/${story.slug}`}>{story.title}</Link>
            </h2>
            <p>{story.subtitle || story.summary}</p>
            {story.recommendation ? <small>Score {story.recommendation.score}</small> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
