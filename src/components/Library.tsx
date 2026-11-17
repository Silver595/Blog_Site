import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { articles } from '../content';
import { buildIndex, filterArticles } from '../lib/library.mjs';

export const articleIndex = buildIndex(articles);
export default function Library() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [input, setInput] = useState(query);
  useEffect(() => setInput(query), [query]);
  useEffect(() => {
    if (input === query) return;
    const timer = window.setTimeout(() => setParams(previous => {
      const next = new URLSearchParams(previous);
      if (input.trim()) next.set('q', input.trim()); else next.delete('q');
      next.delete('topic'); // Drop obsolete category-filter URLs.
      return next;
    }, { replace: true }), 250);
    return () => clearTimeout(timer);
  }, [input, query, setParams]);
  const results = useMemo(() => filterArticles(articleIndex, query), [query]);
  function clear() { setInput(''); setParams({}); }
  return <main className="library-page" id="main">
    <header className="library-heading"><p className="eyebrow">THE KNOWLEDGE LIBRARY</p><h1>FIELD NOTES.</h1><p>Practical investigations, systems thinking, and lessons from building.</p></header>
    <section className="library-tools" aria-label="Find articles">
      <label htmlFor="article-search">SEARCH THE LIBRARY</label>
      <div className="search-row"><input id="article-search" type="search" value={input} onChange={event => setInput(event.target.value)} placeholder="Search notes, commands or text…" aria-controls="article-results" autoComplete="off" /><button type="button" onClick={clear} disabled={!input && !query}>Reset search</button></div>
    </section>
    <p className="results-count" role="status" aria-live="polite">{input.trim() !== query ? 'Searching…' : `${results.length} ${results.length === 1 ? 'article' : 'articles'}${query ? ` matching “${query}”` : ''}`}</p>
    <section id="article-results" className="library-results" aria-label="Article results">
      {results.map(article => <article className="library-card" key={article.slug}>
        <div className="post-meta"><time dateTime={article.date}>{article.date}</time><span>{article.readingMinutes} MIN READ</span></div>
        <h2><Link to={`/posts/${article.slug}`}>{article.title}<span aria-hidden="true"> ↗</span></Link></h2><p>{article.description}</p>
        <ul className="tags" aria-label="Tags">{article.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
      </article>)}
      {!results.length && <div className="library-empty"><h2>No matching field notes.</h2><p>Try a broader search or clear the current term.</p><button type="button" onClick={clear}>Browse all notes</button></div>}
    </section>
  </main>;
}
