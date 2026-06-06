'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

const topics = ['Local', 'World', 'Politics', 'Business', 'Technology', 'Sports', 'Health', 'Education'];

export default function PreferencePrompt() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(['Local', 'World']);

  useEffect(() => {
    const dismissed = window.localStorage.getItem('dira-preferences-dismissed');
    const timer = window.setTimeout(() => setOpen(!dismissed), 900);

    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    window.localStorage.setItem('dira-preferences-dismissed', 'true');
    setOpen(false);
  }

  function toggle(topic) {
    setSelected((current) => (current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]));
  }

  if (!open) {
    return null;
  }

  return (
    <aside className="preference-panel" aria-label="Choose feed preferences">
      <button className="icon-button panel-close" type="button" onClick={close} aria-label="Close preference prompt">
        <X size={18} aria-hidden="true" />
      </button>
      <div className="panel-icon">
        <SlidersHorizontal size={20} aria-hidden="true" />
      </div>
      <h2>Shape your front page</h2>
      <p>Pick the sections you want Dira to prioritize as personalized accounts come online.</p>
      <div className="topic-picker">
        {topics.map((topic) => (
          <button key={topic} type="button" className={selected.includes(topic) ? 'selected' : ''} onClick={() => toggle(topic)}>
            {topic}
          </button>
        ))}
      </div>
      <button className="primary-button full-width" type="button" onClick={close}>
        Save preferences
      </button>
    </aside>
  );
}
