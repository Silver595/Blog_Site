import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { articles } from '../content';
import { buildIndex, filterArticles, topics } from '../lib/library.mjs';

export const articleIndex = buildIndex(articles);
const collections = topics(articleIndex);
export default function Library() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? ''; const topic = params.get('topic') ?? '';
  const [input, setInput] = useState(query);
  useEffect(() => setInput(query), [query]);
  useEffect(() => {
    if (input === query) return;
    const timer = window.setTimeout(() => setParams(previous => {
      const next = new URLSearchParams(previous); if (input.trim()) next.set('q', input.trim()); else next.delete('q'); return next;
    }, { replace: true }), 250);
    return () => clearTimeout(timer);
  }, [input, query, setParams]);
  const results = useMemo(() => filterArticles(articleIndex, query, topic), [query, topic]);
  function selectTopic(name: string) {
    setParams(previous => { const next = new URLSearchParams(previous); if (name) next.set('topic', name); else next.delete('topic'); return next; });
  }
  function clear() { setInput(''); setParams({}); }
  return <main className="library-page" id="main">
    <header className="library-heading"><p className="eyebrow">THE KNOWLEDGE LIBRARY</p><h1>FIELD NOTES.</h1><p>Practical investigations, systems thinking, and lessons from building.</p></header>
    <section className="library-tools" aria-label="Find articles">
      <label htmlFor="article-search">SEARCH THE LIBRARY</label>
      <div className="search-row"><input id="article-search" type="search" value={input} onChange={event => setInput(event.target.value)} placeholder="Search concepts, commands, or tags…" aria-controls="article-results" autoComplete="off" /><button type="button" onClick={clear} disabled={!input && !topic}>Reset filters</button></div>
      <fieldset className="topic-list"><legend>BROWSE BY TOPIC</legend>
        <button type="button" aria-pressed={!topic} onClick={() => selectTopic('')}>All notes <span>{articleIndex.length}</span></button>
        {collections.map(({ name, count }) => <button key={name} type="button" aria-pressed={topic === name} onClick={() => selectTopic(name)}>{name} <span>{count}</span></button>)}
      </fieldset>
    </section>
    <p className="results-count" role="status" aria-live="polite">{input.trim() !== query ? 'Searching…' : `${results.length} ${results.length === 1 ? 'article' : 'articles'}${topic ? ` in ${topic}` : ''}${query ? ` matching “${query}”` : ''}`}</p>
    <section id="article-results" className="library-results" aria-label="Article results">
      {results.map(article => <article className="library-card" key={article.slug}>
        <div className="post-meta"><span>{article.category}</span><time dateTime={article.date}>{article.date}</time><span>{article.readingMinutes} MIN READ</span></div>
        <h2><Link to={`/posts/${article.slug}`}>{article.title}<span aria-hidden="true"> ↗</span></Link></h2><p>{article.description}</p>
        <ul className="tags" aria-label="Tags">{article.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
      </article>)}
      {!results.length && <div className="library-empty"><h2>{query ? 'No matching field notes.' : 'This collection is still growing.'}</h2><p>{query ? 'Try a broader term or reset the topic filter.' : 'No articles have been published in this topic yet.'}</p><button onClick={clear}>Browse all notes</button></div>}
    </section>
  </main>;
}
