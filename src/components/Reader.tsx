import { isValidElement, useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Prism from '../vendor/prism';
import { articleIndex } from './Library';
import { relatedArticles } from '../lib/library.mjs';

function CodeBlock({ children }: { children?: ReactNode }) {
  const element = isValidElement<{ children?: string; className?: string }>(children) ? children : null;
  const code = String(element?.props.children ?? '');
  const language = element?.props.className?.match(/language-([\w-]+)/)?.[1] ?? 'text';
  const aliases: Record<string, string> = { js: 'javascript', sh: 'bash', shell: 'bash', py: 'python', yml: 'yaml' };
  const name = aliases[language] ?? language;
  const grammar = Object.prototype.hasOwnProperty.call(Prism.languages, name) ? Prism.languages[name] : undefined;
  const html = grammar && code.length < 30000 ? Prism.highlight(code, grammar, name) : null;
  const [status, setStatus] = useState('');
  useEffect(() => { if (!status) return; const timer = window.setTimeout(() => setStatus(''), 3000); return () => clearTimeout(timer); }, [status]);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setStatus('Copied'); }
    catch { setStatus('Copy failed. Select and copy the code.'); }
  }
  return <div className="code-block"><div className="code-toolbar"><span>{language}</span><button type="button" aria-label={`Copy ${language} code`} onClick={copy}>Copy code</button></div><span className="copy-status" role="status">{status}</span><pre tabIndex={0} aria-label={`${language} code`}><code className={`language-${name}`} {...(html ? { dangerouslySetInnerHTML: { __html: html } } : { children: code })} /></pre></div>;
}
function Heading({ level, id, children }: { level: 1 | 2 | 3 | 4 | 5 | 6; id?: string; children?: ReactNode }) {
  const Tag = `h${level}` as 'h1';
  return <Tag id={id}><a className="heading-anchor" href={`#${id}`} aria-label={`Link to ${typeof children === 'string' ? children : 'section'}`}>#</a>{children}</Tag>;
}
const components: Components = {
  pre: CodeBlock,
  h1: ({ id, children }) => <Heading level={2} id={id}>{children}</Heading>,
  h2: ({ id, children }) => <Heading level={2} id={id}>{children}</Heading>,
  h3: ({ id, children }) => <Heading level={3} id={id}>{children}</Heading>,
  h4: ({ id, children }) => <Heading level={4} id={id}>{children}</Heading>,
  h5: ({ id, children }) => <Heading level={5} id={id}>{children}</Heading>,
  h6: ({ id, children }) => <Heading level={6} id={id}>{children}</Heading>,
  table: ({ children }) => <div className="table-scroll" tabIndex={0} role="region" aria-label="Article table"><table>{children}</table></div>,
  a: ({ href, children }) => href?.startsWith('/posts/') ? <Link to={href}>{children}</Link> : <a href={href} target={/^https?:/.test(href ?? '') ? '_blank' : undefined} rel={/^https?:/.test(href ?? '') ? 'noopener noreferrer' : undefined}>{children}</a>,
  img: ({ node: _node, ...props }: ComponentPropsWithoutRef<'img'> & { node?: unknown }) => <img {...props} alt={props.alt ?? ''} loading="lazy" />,
};
export default function Reader() {
  const { slug } = useParams(); const article = articleIndex.find(item => item.slug === slug);
  useEffect(() => { if (article) document.title = `${article.title} — Silver Life`; return () => { document.title = 'Silver Life — Build Real Tech Skills'; }; }, [article]);
  if (!article) return <main className="not-found"><span>ERROR 404</span><h1>THIS PATH DOES NOT EXIST.</h1><Link to="/posts">BROWSE THE LIBRARY</Link></main>;
  const position = articleIndex.indexOf(article); const previous = articleIndex[position - 1]; const next = articleIndex[position + 1];
  const related = relatedArticles(articleIndex, article);
  return <main className="article-page" id="main">
    <Link className="article-back" to="/posts">← ALL FIELD NOTES</Link>
    <div className="post-meta"><Link to={`/posts?topic=${encodeURIComponent(article.category)}`}>{article.category}</Link><time dateTime={article.date}>{article.date}</time><span>{article.readingMinutes} MIN READ</span></div>
    <h1>{article.title}</h1><p className="article-description">{article.description}</p>
    <ul className="tags" aria-label="Article tags">{article.tags.map(tag => <li key={tag}><Link to={`/posts?q=${encodeURIComponent(tag)}`}>{tag}</Link></li>)}</ul>
    {article.cover && <img className="article-cover" src={article.cover} alt="" />}
    {article.headings.length > 0 && <nav className="table-of-contents" aria-label="On this page"><h2>ON THIS PAGE</h2><ol>{article.headings.map(heading => <li key={heading.id} className={heading.depth > 2 ? 'toc-nested' : undefined}><a href={`#${heading.id}`}>{heading.title}</a></li>)}</ol></nav>}
    <article className="article-content" key={article.slug}><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>{article.body}</ReactMarkdown></article>
    {(previous || next) && <nav className="article-neighbors" aria-label="Previous and next articles">
      {previous && <Link to={`/posts/${previous.slug}`}><span>← PREVIOUS</span>{previous.title}</Link>}
      {next && <Link to={`/posts/${next.slug}`}><span>NEXT →</span>{next.title}</Link>}
    </nav>}
    {related.length > 0 && <section className="related-articles"><h2>CONTINUE EXPLORING</h2>{related.map(item => <Link key={item.slug} to={`/posts/${item.slug}`}>{item.title}<span aria-hidden="true"> ↗</span></Link>)}</section>}
    <Link className="article-back" to="/posts">← BACK TO LIBRARY</Link>
  </main>;
}
