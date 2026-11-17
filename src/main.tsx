import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  Outlet,
  ScrollRestoration,
  useParams,
} from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { articles, featuredArticle } from "./content";
import "./index.css";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" className={diagonal ? "arrow arrow-diagonal" : "arrow"} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M14 7l5 5-5 5" />
  </svg>;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return <header className="nav-wrap">
    <Link className="brand" to="/" aria-label="Silver Life home" onClick={closeMenu}>
      <span className="brand-mark">S/</span><span>SILVER LIFE</span>
    </Link>
    <nav className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="Main navigation">
      <Link to="/" onClick={closeMenu}>HOME</Link>
      <Link to="/posts" onClick={closeMenu}>POSTS</Link>
      <span className="nav-upcoming">ABOUT · NEXT</span>
      <a className="nav-cta" href="https://github.com/Silver595" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
        GITHUB <Arrow />
      </a>
    </nav>
    <button className="menu-button" type="button" aria-label="Toggle navigation"
      aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><span /><span /></button>
  </header>;
}

function Root() {
  return <div className="site-shell"><Header /><Outlet /><ScrollRestoration /></div>;
}

function Home() {
  return <main id="top">
    <section className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-heading-wrap"><h1>BUILD REAL<br /><span className="outline-text">TECH SKILLS.</span></h1></div>
      <div className="hero-bottom">
        <p className="hero-copy">Structured paths. Live environments. Zero filler. Learn the systems behind modern technology by actually building them.</p>
        <Link className="hero-link" to="/posts">EXPLORE THE FIELD NOTES <Arrow diagonal /></Link>
      </div>
    </section>
  </main>;
}

function Posts() {
  return <main className="posts-page">
    <section className="posts" aria-label="Published articles">
      {featuredArticle && <article className="featured-post">
        <div className="featured-visual">{featuredArticle.cover && <img src={featuredArticle.cover} alt="" />}</div>
        <div className="featured-copy">
          <div className="post-meta"><span>FEATURED</span><span>{featuredArticle.category}</span></div>
          <h2>{featuredArticle.title}</h2><p>{featuredArticle.description}</p>
          <Link className="read-link" to={`/posts/${featuredArticle.slug}`}>READ ARTICLE <Arrow diagonal /></Link>
        </div>
      </article>}
      <div className="post-list">
        {articles.filter((article) => article.slug !== featuredArticle?.slug).map((article) =>
          <Link className="post-row post-row-link" to={`/posts/${article.slug}`} key={article.slug}>
            <div className="post-image">{article.cover && <img src={article.cover} alt="" />}</div>
            <div className="post-row-main">
              <div className="post-meta"><span>{article.category}</span><span>{article.date}</span></div>
              <h2>{article.title}</h2><p>{article.description}</p>
            </div>
            <span className="post-arrow"><Arrow diagonal /></span>
          </Link>
        )}
      </div>
      {articles.length === 0 && <p>No published articles yet. Add a Markdown file with publish: true.</p>}
      <div className="posts-footer"><span>FIELD NOTES & TECHNICAL WRITING</span><Link to="/">BACK HOME <Arrow /></Link></div>
    </section>
  </main>;
}

function ArticlePage() {
  const { slug } = useParams();
  const article = articles.find((candidate) => candidate.slug === slug);
  if (!article) return <NotFound />;
  return <main className="article-page">
    <Link className="article-back" to="/posts">← ALL POSTS</Link>
    <div className="post-meta"><span>{article.category}</span><span>{article.date}</span></div>
    <h1>{article.title}</h1><p className="article-description">{article.description}</p>
    {article.cover && <img className="article-cover" src={article.cover} alt="" />}
    <article className="article-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={{
        a: ({ href, children, ...props }) => <a href={href} {...props}
          target={href?.startsWith("http") ? "_blank" : undefined}
          rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>{children}</a>,
        img: ({ alt, ...props }) => <img alt={alt ?? ""} loading="lazy" {...props} />,
      }}>{article.body}</ReactMarkdown>
    </article>
    <Link className="article-back" to="/posts">← BACK TO POSTS</Link>
  </main>;
}

function NotFound() {
  return <main className="not-found"><span>ERROR 404</span>
    <h1>THIS PATH DOES NOT EXIST.</h1>
    <Link to="/">RETURN HOME <Arrow /></Link>
  </main>;
}

const router = createBrowserRouter([{
  path: "/", Component: Root, children: [
    { index: true, Component: Home },
    { path: "posts", Component: Posts },
    { path: "posts/:slug", Component: ArticlePage },
    { path: "*", Component: NotFound },
  ],
}]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
);
