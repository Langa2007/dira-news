'use client';

import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from '@/lib/endpoints';

const socketUrl = SOCKET_BASE_URL;

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

export default function BreakingTicker({ initialStories = [] }) {
  const [updates, setUpdates] = useState(
    uniqueStories(initialStories).slice(0, 4).map((story) => ({
      id: story.id,
      title: story.title,
      slug: story.slug,
      publishedAt: story.publishedAt
    }))
  );

  useEffect(() => {
    if (!socketUrl) {
      return undefined;
    }

    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 4
    });

    socket.on('article.published', (article) => {
      setUpdates((current) => [
        {
          id: article.id,
          title: article.title,
          slug: article.slug,
          publishedAt: article.publishedAt
        },
        ...current.filter((item) => item.id !== article.id)
      ].slice(0, 5));
    });

    return () => socket.close();
  }, []);

  return (
    <section className="breaking-ticker" aria-label="Realtime breaking news">
      <div className="ticker-label">
        <Radio size={17} aria-hidden="true" />
        <span>Live desk</span>
      </div>
      <div className="ticker-items">
        {updates.map((item) => (
          <a key={item.id} href={`/articles/${item.slug}`}>
            {item.title}
          </a>
        ))}
      </div>
    </section>
  );
}
