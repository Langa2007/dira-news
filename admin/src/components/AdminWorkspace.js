'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  ClipboardList,
  FilePenLine,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  RadioTower,
  RefreshCw,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud
} from 'lucide-react';
import { adminLogin, adminRequest } from '@/lib/adminApi';

const tabs = [
  ['overview', 'Overview', LayoutDashboard],
  ['sources', 'Sources', RadioTower],
  ['clusters', 'Clusters', ClipboardList],
  ['briefing', 'AI Briefing', Bot],
  ['verification', 'Verification', ShieldCheck],
  ['editor', 'Editor', FilePenLine],
  ['media', 'Media', ImageIcon],
  ['social', 'Social', Megaphone],
  ['publishing', 'Publishing', Send],
  ['analytics', 'Analytics', Activity]
];

const categories = ['LOCAL', 'WORLD', 'POLITICS', 'BUSINESS', 'TECHNOLOGY', 'SPORTS', 'ENTERTAINMENT', 'HEALTH', 'EDUCATION', 'OPINION'];
const sourceTypes = ['RSS', 'API', 'STATIC_PAGE', 'RENDERED_PAGE', 'SOCIAL_PUBLIC', 'DATASET', 'PRESS_RELEASE', 'LICENSED_FEED'];
const clusterStatuses = ['CANDIDATE', 'REVIEWING', 'APPROVED', 'DISMISSED', 'MERGED'];
const licenseStatuses = ['UNKNOWN', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'];
const draftTargets = ['WHATSAPP_DRAFT', 'INSTAGRAM_DRAFT', 'X_DRAFT', 'TELEGRAM'];
const publishTargets = ['WEBSITE', 'APP_FEED', 'TELEGRAM', 'WHATSAPP_DRAFT', 'INSTAGRAM_DRAFT', 'X_DRAFT', 'RSS', 'SITEMAP'];
const assistantTasks = ['ARTICLE_OUTLINE', 'ARTICLE_DRAFT', 'HEADLINE_OPTIONS', 'SEO_METADATA', 'BIAS_SCAN', 'SIMILARITY_SCAN', 'CONTRADICTION_SCAN'];

const initialData = {
  me: null,
  health: null,
  articles: [],
  sources: [],
  documents: [],
  clusters: [],
  aiOutputs: [],
  media: [],
  drafts: [],
  logs: [],
  topics: [],
  regions: []
};

function formatDate(date) {
  if (!date) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(date));
}

function statusClass(status) {
  return `admin-pill ${String(status || 'UNKNOWN').toLowerCase().replaceAll('_', '-')}`;
}

function Field({ label, children }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function EmptyNotice({ title, text }) {
  return (
    <div className="admin-empty">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function singularKey(key) {
  return {
    articles: 'article',
    sources: 'source',
    documents: 'documents',
    clusters: 'clusters',
    media: 'media',
    topics: 'topics',
    regions: 'regions'
  }[key];
}

export default function AdminWorkspace() {
  const [activeTab, setActiveTab] = useState('overview');
  const [token, setToken] = useState(() => (typeof window !== 'undefined' ? window.localStorage.getItem('dira-access-token') || '' : ''));
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState({ loading: true, message: 'Loading newsroom state...', error: '' });
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [workflow, setWorkflow] = useState(null);

  const metrics = useMemo(() => {
    const published = data.articles.filter((article) => article.status === 'PUBLISHED').length;
    const review = data.articles.filter((article) => ['DRAFT', 'REVIEW', 'APPROVED', 'SCHEDULED'].includes(article.status)).length;
    const licenseIssues = data.media.filter((media) => media.licenseStatus !== 'APPROVED').length;
    const queuedTargets = data.logs.filter((log) => log.status === 'QUEUED').length;

    return [
      ['Published', published],
      ['In workflow', review],
      ['Source docs', data.documents.length],
      ['License checks', licenseIssues],
      ['Queued targets', queuedTargets],
      ['AI outputs', data.aiOutputs.length]
    ];
  }, [data]);

  const loadWorkspace = useCallback(async (activeToken = token) => {
    setStatus({ loading: true, message: 'Refreshing newsroom state...', error: '' });

    const requests = [
      ['health', () => adminRequest('/health', { token: activeToken })],
      ['me', () => (activeToken ? adminRequest('/auth/me', { token: activeToken }) : Promise.resolve({ user: null }))],
      ['articles', () => adminRequest('/articles?status=', { token: activeToken })],
      ['sources', () => adminRequest('/sources', { token: activeToken })],
      ['documents', () => adminRequest('/sources/documents', { token: activeToken })],
      ['clusters', () => adminRequest('/story-clusters', { token: activeToken })],
      ['aiOutputs', () => adminRequest('/ai-outputs', { token: activeToken })],
      ['media', () => adminRequest('/media', { token: activeToken })],
      ['drafts', () => adminRequest('/social-drafts', { token: activeToken })],
      ['logs', () => adminRequest('/publishing/logs', { token: activeToken })],
      ['topics', () => adminRequest('/topics', { token: activeToken })],
      ['regions', () => adminRequest('/regions', { token: activeToken })]
    ];

    const results = await Promise.allSettled(requests.map(([, request]) => request()));
    const nextData = { ...initialData };
    const failures = [];

    results.forEach((result, index) => {
      const key = requests[index][0];

      if (result.status === 'fulfilled') {
        nextData[key] =
          result.value[key] ||
          result.value[singularKey(key)] ||
          result.value.outputs ||
          result.value.drafts ||
          result.value.logs ||
          result.value.user ||
          result.value;
      } else {
        failures.push(`${key}: ${result.reason.message}`);
      }
    });

    setData(nextData);
    setStatus({
      loading: false,
      message: failures.length ? 'Some panels are locked until an editor/admin token is available.' : 'Newsroom state is current.',
      error: failures.join(' | ')
    });
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadWorkspace(token), 0);

    return () => window.clearTimeout(timer);
  }, [loadWorkspace, token]);

  async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus({ loading: true, message: 'Signing in...', error: '' });

    try {
      const response = await adminLogin({
        email: form.get('email'),
        password: form.get('password')
      });
      const accessToken = response.accessToken;
      window.localStorage.setItem('dira-access-token', accessToken);
      setToken(accessToken);
      await loadWorkspace(accessToken);
    } catch (error) {
      setStatus({ loading: false, message: 'Sign in failed.', error: error.message });
    }
  }

  async function action(label, request) {
    setStatus({ loading: true, message: `${label}...`, error: '' });

    try {
      await request();
      await loadWorkspace(token);
      setStatus({ loading: false, message: `${label} complete.`, error: '' });
    } catch (error) {
      setStatus({ loading: false, message: `${label} failed.`, error: error.message });
    }
  }

  async function loadWorkflow(articleId = selectedArticleId) {
    if (!articleId) {
      return;
    }

    await action('Loading article workflow', async () => {
      const result = await adminRequest(`/editorial/articles/${articleId}/workflow`, { token });
      setWorkflow(result);
    });
  }

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/">
          <span className="brand-mark">D</span>
          <span>
            <strong>Dira Desk</strong>
            <small>Editorial command</small>
          </span>
        </Link>
        <nav aria-label="Admin sections">
          {tabs.map(([id, label, Icon]) => (
            <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Admin panel</p>
            <h1>{tabs.find(([id]) => id === activeTab)?.[1]}</h1>
          </div>
          <div className="admin-top-actions">
            <span className={status.loading ? 'admin-status loading' : 'admin-status'}>{status.loading ? 'Working' : 'Ready'}</span>
            <button className="secondary-button" type="button" onClick={() => loadWorkspace(token)}>
              <RefreshCw size={16} aria-hidden="true" />
              Refresh
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={async () => {
                if (!token) {
                  setStatus({ loading: false, message: 'Please sign in as admin to run pipeline.', error: '' });
                  return;
                }

                if (!window.confirm('Run news refresh pipeline now? This will scrape sources and run clustering/drafting.')) {
                  return;
                }

                await action('Refreshing pipeline', () => adminRequest('/admin/pipeline/refresh', { method: 'POST', token }));
              }}
            >
              <Newspaper size={16} aria-hidden="true" />
              Run pipeline
            </button>
          </div>
        </header>

        <section className="admin-alert">
          <p>{status.message}</p>
          {status.error ? <small>{status.error}</small> : null}
        </section>

        {!token ? <AdminLogin onSubmit={handleLogin} /> : null}

        {activeTab === 'overview' ? <OverviewPanel data={data} metrics={metrics} /> : null}
        {activeTab === 'sources' ? <SourcesPanel data={data} action={action} token={token} /> : null}
        {activeTab === 'clusters' ? <ClustersPanel data={data} action={action} token={token} /> : null}
        {activeTab === 'briefing' ? <BriefingPanel data={data} action={action} token={token} /> : null}
        {activeTab === 'verification' ? (
          <VerificationPanel
            data={data}
            action={action}
            token={token}
            selectedArticleId={selectedArticleId}
            setSelectedArticleId={setSelectedArticleId}
            workflow={workflow}
            loadWorkflow={loadWorkflow}
          />
        ) : null}
        {activeTab === 'editor' ? <EditorPanel data={data} action={action} token={token} /> : null}
        {activeTab === 'media' ? <MediaPanel data={data} action={action} token={token} /> : null}
        {activeTab === 'social' ? <SocialPanel data={data} action={action} token={token} /> : null}
        {activeTab === 'publishing' ? <PublishingPanel data={data} action={action} token={token} /> : null}
        {activeTab === 'analytics' ? <AnalyticsPanel data={data} metrics={metrics} /> : null}
      </section>
    </main>
  );
}

function AdminLogin({ onSubmit }) {
  return (
    <form className="admin-login" onSubmit={onSubmit}>
      <Field label="Editor email">
        <input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <button className="primary-button" type="submit">
        Sign in
      </button>
    </form>
  );
}

function OverviewPanel({ data, metrics }) {
  return (
    <section className="admin-panel-stack">
      <div className="admin-metrics">
        {metrics.map(([label, value]) => (
          <div className="admin-metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="admin-grid two">
        <QueuePanel title="Editorial queue" items={data.articles.slice(0, 8)} empty="No articles in the queue." />
        <QueuePanel title="Publishing queue" items={data.logs.slice(0, 8)} empty="No publish targets yet." />
      </div>
    </section>
  );
}

function QueuePanel({ title, items, empty }) {
  return (
    <section className="admin-surface">
      <div className="admin-section-head">
        <h2>{title}</h2>
      </div>
      {items.length ? (
        <div className="admin-list">
          {items.map((item) => (
            <article key={item.id} className="admin-list-row">
              <div>
                <strong>{item.title || item.article?.title || item.type}</strong>
                <span>{item.slug || item.article?.slug || formatDate(item.updatedAt)}</span>
              </div>
              <span className={statusClass(item.status)}>{item.status}</span>
            </article>
          ))}
        </div>
      ) : (
        <EmptyNotice title={empty} text="As backend activity grows, this panel will fill automatically." />
      )}
    </section>
  );
}

function SourcesPanel({ data, action, token }) {
  async function createSource(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action('Creating source', () =>
      adminRequest('/sources', {
        method: 'POST',
        token,
        body: {
          name: form.get('name'),
          type: form.get('type'),
          homepageUrl: form.get('homepageUrl'),
          feedUrl: form.get('feedUrl') || undefined,
          credibilityScore: Number(form.get('credibilityScore') || 0.5)
        }
      })
    );
    event.currentTarget.reset();
  }

  return (
    <section className="admin-grid two uneven">
      <section className="admin-surface">
        <div className="admin-section-head">
          <h2>Source monitor</h2>
          <span>{data.sources.length} sources</span>
        </div>
        <div className="admin-table">
          {data.sources.map((source) => (
            <article key={source.id} className="admin-table-row">
              <div>
                <strong>{source.name}</strong>
                <span>{source.type} · {source.homepageUrl}</span>
              </div>
              <span className={statusClass(source.status)}>{source.status}</span>
              <button type="button" onClick={() => action('Queueing source fetch', () => adminRequest(`/sources/${source.id}/fetch`, { method: 'POST', token }))}>
                Queue fetch
              </button>
            </article>
          ))}
        </div>
      </section>
      <form className="admin-surface admin-form" onSubmit={createSource}>
        <h2>Add source</h2>
        <Field label="Name">
          <input name="name" required />
        </Field>
        <Field label="Type">
          <select name="type">{sourceTypes.map((type) => <option key={type}>{type}</option>)}</select>
        </Field>
        <Field label="Homepage URL">
          <input name="homepageUrl" type="url" required />
        </Field>
        <Field label="Feed URL">
          <input name="feedUrl" type="url" />
        </Field>
        <Field label="Credibility score">
          <input name="credibilityScore" type="number" min="0" max="1" step="0.05" defaultValue="0.5" />
        </Field>
        <button className="primary-button" type="submit">Add source</button>
      </form>
    </section>
  );
}

function ClustersPanel({ data, action, token }) {
  return (
    <section className="admin-surface">
      <div className="admin-section-head">
        <h2>Story clusters</h2>
        <span>{data.clusters.length} clusters</span>
      </div>
      <div className="admin-cluster-grid">
        {data.clusters.map((cluster) => (
          <article key={cluster.id} className="admin-cluster">
            <div>
              <span className={statusClass(cluster.status)}>{cluster.status}</span>
              <h3>{cluster.title}</h3>
              <p>{cluster.summary || 'No summary yet.'}</p>
            </div>
            <div className="admin-score-line">
              <span>Hot {cluster.hotnessScore}</span>
              <span>Local {cluster.localScore}</span>
              <span>World {cluster.worldScore}</span>
            </div>
            <div className="admin-button-row">
              {clusterStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    action(`Marking cluster ${status}`, () =>
                      adminRequest(`/editorial/story-clusters/${cluster.id}/review`, { method: 'PATCH', token, body: { status } })
                    )
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BriefingPanel({ data, action, token }) {
  async function runAssistant(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action('Running editorial assistant', () =>
      adminRequest('/editorial/assistant', {
        method: 'POST',
        token,
        body: {
          task: form.get('task'),
          articleId: form.get('articleId') || undefined,
          clusterId: form.get('clusterId') || undefined,
          instructions: form.get('instructions') || undefined
        }
      })
    );
  }

  return (
    <section className="admin-grid two">
      <form className="admin-surface admin-form" onSubmit={runAssistant}>
        <h2>AI briefing panel</h2>
        <Field label="Task">
          <select name="task">{assistantTasks.map((task) => <option key={task}>{task}</option>)}</select>
        </Field>
        <Field label="Article">
          <select name="articleId">
            <option value="">No article selected</option>
            {data.articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
          </select>
        </Field>
        <Field label="Cluster">
          <select name="clusterId">
            <option value="">No cluster selected</option>
            {data.clusters.map((cluster) => <option key={cluster.id} value={cluster.id}>{cluster.title}</option>)}
          </select>
        </Field>
        <Field label="Instructions">
          <textarea name="instructions" rows="5" />
        </Field>
        <button className="primary-button" type="submit">Run assistant</button>
      </form>
      <section className="admin-surface">
        <div className="admin-section-head">
          <h2>Recent AI outputs</h2>
          <span>{data.aiOutputs.length}</span>
        </div>
        <div className="admin-list">
          {data.aiOutputs.slice(0, 12).map((output) => (
            <article className="admin-list-row" key={output.id}>
              <div>
                <strong>{output.type}</strong>
                <span>{output.provider} · {formatDate(output.createdAt)}</span>
              </div>
              <span className="admin-pill">{output.score ?? 'n/a'}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function VerificationPanel({ data, action, token, selectedArticleId, setSelectedArticleId, workflow, loadWorkflow }) {
  async function attachEvidence(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action('Attaching evidence', () =>
      adminRequest(`/editorial/articles/${selectedArticleId}/evidence`, {
        method: 'POST',
        token,
        body: {
          documentId: form.get('documentId'),
          text: form.get('text'),
          confidence: Number(form.get('confidence') || 0.5)
        }
      })
    );
    await loadWorkflow(selectedArticleId);
  }

  async function addComment(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action('Adding editorial comment', () =>
      adminRequest(`/editorial/articles/${selectedArticleId}/comments`, {
        method: 'POST',
        token,
        body: {
          status: form.get('status'),
          notes: form.get('notes')
        }
      })
    );
    await loadWorkflow(selectedArticleId);
  }

  return (
    <section className="admin-grid two">
      <section className="admin-surface admin-form">
        <h2>Verification desk</h2>
        <Field label="Article">
          <select value={selectedArticleId} onChange={(event) => setSelectedArticleId(event.target.value)}>
            <option value="">Choose article</option>
            {data.articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
          </select>
        </Field>
        <button className="secondary-button" type="button" onClick={() => loadWorkflow()}>Load workflow</button>
        {workflow ? (
          <div className="admin-readiness">
            {Object.entries(workflow.readiness).map(([key, value]) => (
              <span key={key} className={value ? 'ready' : ''}>
                <CheckCircle2 size={15} aria-hidden="true" />
                {key}
              </span>
            ))}
          </div>
        ) : null}
      </section>
      <section className="admin-surface admin-form">
        <h2>Evidence and comments</h2>
        <form onSubmit={attachEvidence} className="admin-nested-form">
          <Field label="Source document">
            <select name="documentId" required>
              <option value="">Choose document</option>
              {data.documents.map((document) => <option key={document.id} value={document.id}>{document.title}</option>)}
            </select>
          </Field>
          <Field label="Claim text">
            <textarea name="text" rows="3" required />
          </Field>
          <Field label="Confidence">
            <input name="confidence" type="number" min="0" max="1" step="0.05" defaultValue="0.5" />
          </Field>
          <button className="secondary-button" type="submit" disabled={!selectedArticleId}>Attach evidence</button>
        </form>
        <form onSubmit={addComment} className="admin-nested-form">
          <Field label="Comment status">
            <input name="status" defaultValue="COMMENT" required />
          </Field>
          <Field label="Notes">
            <textarea name="notes" rows="3" required />
          </Field>
          <button className="secondary-button" type="submit" disabled={!selectedArticleId}>Add comment</button>
        </form>
      </section>
    </section>
  );
}

function EditorPanel({ data, action, token }) {
  async function createArticle(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action('Creating article', () =>
      adminRequest('/articles', {
        method: 'POST',
        token,
        body: {
          title: form.get('title'),
          subtitle: form.get('subtitle') || undefined,
          category: form.get('category'),
          regionId: form.get('regionId') || undefined,
          clusterId: form.get('clusterId') || undefined,
          body: form.get('body') || undefined,
          summary: form.get('summary') || undefined,
          seoTitle: form.get('seoTitle') || undefined,
          seoDescription: form.get('seoDescription') || undefined,
          isBreaking: form.get('isBreaking') === 'on',
          topicIds: form.getAll('topicIds').filter(Boolean)
        }
      })
    );
    event.currentTarget.reset();
  }

  return (
    <section className="admin-grid two uneven">
      <form className="admin-surface admin-form" onSubmit={createArticle}>
        <h2>Article editor</h2>
        <Field label="Headline">
          <input name="title" required />
        </Field>
        <Field label="Subtitle">
          <input name="subtitle" />
        </Field>
        <div className="admin-form-grid">
          <Field label="Category">
            <select name="category">{categories.map((category) => <option key={category}>{category}</option>)}</select>
          </Field>
          <Field label="Region">
            <select name="regionId">
              <option value="">None</option>
              {data.regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Story cluster">
          <select name="clusterId">
            <option value="">None</option>
            {data.clusters.map((cluster) => <option key={cluster.id} value={cluster.id}>{cluster.title}</option>)}
          </select>
        </Field>
        <Field label="Summary">
          <textarea name="summary" rows="3" />
        </Field>
        <Field label="Body">
          <textarea name="body" rows="9" />
        </Field>
        <div className="admin-form-grid">
          <Field label="SEO title">
            <input name="seoTitle" />
          </Field>
          <Field label="SEO description">
            <input name="seoDescription" />
          </Field>
        </div>
        <label className="admin-check">
          <input name="isBreaking" type="checkbox" />
          Breaking story
        </label>
        <Field label="Topics">
          <select name="topicIds" multiple>
            {data.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
          </select>
        </Field>
        <button className="primary-button" type="submit">Save article draft</button>
      </form>
      <QueuePanel title="Recent articles" items={data.articles.slice(0, 10)} empty="No articles created yet." />
    </section>
  );
}

function MediaPanel({ data, action, token }) {
  async function createMedia(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action('Creating media asset', () =>
      adminRequest('/media', {
        method: 'POST',
        token,
        body: {
          url: form.get('url'),
          title: form.get('title') || undefined,
          altText: form.get('altText') || undefined,
          sourceUrl: form.get('sourceUrl') || undefined,
          owner: form.get('owner') || undefined,
          licenseType: form.get('licenseType') || undefined,
          attribution: form.get('attribution') || undefined,
          licenseStatus: form.get('licenseStatus')
        }
      })
    );
  }

  return (
    <section className="admin-grid two">
      <form className="admin-surface admin-form" onSubmit={createMedia}>
        <h2>Media library</h2>
        <Field label="Asset URL">
          <input name="url" type="url" required />
        </Field>
        <Field label="Title">
          <input name="title" />
        </Field>
        <Field label="Alt text">
          <input name="altText" />
        </Field>
        <Field label="Owner">
          <input name="owner" />
        </Field>
        <Field label="License type">
          <input name="licenseType" />
        </Field>
        <Field label="Attribution">
          <input name="attribution" />
        </Field>
        <Field label="License status">
          <select name="licenseStatus">{licenseStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        </Field>
        <button className="primary-button" type="submit">Add media</button>
      </form>
      <section className="admin-surface">
        <div className="admin-section-head">
          <h2>License queue</h2>
          <span>{data.media.length}</span>
        </div>
        <div className="admin-list">
          {data.media.map((media) => (
            <article key={media.id} className="admin-list-row">
              <div>
                <strong>{media.title || media.url}</strong>
                <span>{media.owner || 'Owner unknown'}</span>
              </div>
              <select
                value={media.licenseStatus}
                onChange={(event) =>
                  action('Updating license', () =>
                    adminRequest(`/editorial/media/${media.id}/license`, {
                      method: 'PATCH',
                      token,
                      body: { licenseStatus: event.target.value }
                    })
                  )
                }
              >
                {licenseStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function SocialPanel({ data, action, token }) {
  async function createDraft(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action('Creating social draft', () =>
      adminRequest('/social-drafts', {
        method: 'POST',
        token,
        body: {
          articleId: form.get('articleId') || undefined,
          target: form.get('target'),
          text: form.get('text'),
          status: 'DRAFT'
        }
      })
    );
  }

  return (
    <section className="admin-grid two">
      <form className="admin-surface admin-form" onSubmit={createDraft}>
        <h2>Social draft queue</h2>
        <Field label="Article">
          <select name="articleId">
            <option value="">Standalone draft</option>
            {data.articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
          </select>
        </Field>
        <Field label="Target">
          <select name="target">{draftTargets.map((target) => <option key={target}>{target}</option>)}</select>
        </Field>
        <Field label="Draft text">
          <textarea name="text" rows="8" required />
        </Field>
        <button className="primary-button" type="submit">Create draft</button>
      </form>
      <section className="admin-surface">
        <div className="admin-section-head">
          <h2>Drafts</h2>
          <span>{data.drafts.length}</span>
        </div>
        <div className="admin-list">
          {data.drafts.map((draft) => (
            <article key={draft.id} className="admin-social-row">
              <div>
                <span className="admin-pill">{draft.target}</span>
                <strong>{draft.article?.title || 'Standalone draft'}</strong>
                <p>{draft.text}</p>
              </div>
              <select
                value={draft.status}
                onChange={(event) =>
                  action('Updating draft status', () =>
                    adminRequest(`/publishing/social-drafts/${draft.id}/status`, {
                      method: 'PATCH',
                      token,
                      body: { status: event.target.value }
                    })
                  )
                }
              >
                {['DRAFT', 'QUEUED', 'APPROVED', 'SENT', 'REJECTED'].map((status) => <option key={status}>{status}</option>)}
              </select>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function PublishingPanel({ data, action, token }) {
  async function publishArticle(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action('Publishing article', () =>
      adminRequest(`/publishing/articles/${form.get('articleId')}/publish`, {
        method: 'POST',
        token,
        body: {
          channels: form.getAll('channels')
        }
      })
    );
  }

  return (
    <section className="admin-grid two">
      <form className="admin-surface admin-form" onSubmit={publishArticle}>
        <h2>Telegram and channel controls</h2>
        <Field label="Article">
          <select name="articleId" required>
            <option value="">Choose article</option>
            {data.articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
          </select>
        </Field>
        <div className="admin-checkbox-grid">
          {publishTargets.map((target) => (
            <label key={target} className="admin-check">
              <input name="channels" type="checkbox" value={target} defaultChecked={['WEBSITE', 'APP_FEED', 'RSS', 'SITEMAP'].includes(target)} />
              {target}
            </label>
          ))}
        </div>
        <button className="primary-button" type="submit">
          <UploadCloud size={16} aria-hidden="true" />
          Publish selected channels
        </button>
      </form>
      <section className="admin-surface">
        <div className="admin-section-head">
          <h2>Publish logs</h2>
          <span>{data.logs.length}</span>
        </div>
        <div className="admin-list">
          {data.logs.map((log) => (
            <article key={log.id} className="admin-list-row">
              <div>
                <strong>{log.type}</strong>
                <span>{log.article?.title || log.externalId || formatDate(log.updatedAt)}</span>
              </div>
              <span className={statusClass(log.status)}>{log.status}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function AnalyticsPanel({ data, metrics }) {
  const articleCategories = categories.map((category) => ({
    category,
    count: data.articles.filter((article) => article.category === category).length
  }));
  const maxCount = Math.max(1, ...articleCategories.map((item) => item.count));

  return (
    <section className="admin-panel-stack">
      <div className="admin-metrics">
        {metrics.map(([label, value]) => (
          <div className="admin-metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <section className="admin-surface">
        <div className="admin-section-head">
          <h2>Category distribution</h2>
          <span>Article count</span>
        </div>
        <div className="admin-bars">
          {articleCategories.map((item) => (
            <div key={item.category} className="admin-bar-row">
              <span>{item.category}</span>
              <div><b style={{ width: `${(item.count / maxCount) * 100}%` }} /></div>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
