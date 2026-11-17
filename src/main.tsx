import React, { lazy, Suspense, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  Outlet,
  ScrollRestoration,
} from "react-router";
const Library = lazy(() => import('./components/Library'));
const Reader = lazy(() => import('./components/Reader'));
const Paths = lazy(() => import('./components/Paths'));
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
      <Link to="/paths" onClick={closeMenu}>LEARNING PATHS</Link>
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
  return <div className="site-shell"><a className="skip-link" href="#main">Skip to content</a><Header /><Suspense fallback={<main className="article-page" id="main">Loading article…</main>}><Outlet /></Suspense><ScrollRestoration /></div>;
}

function Home() {
  return <main id="main">
    <section className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-heading-wrap"><h1>BUILD REAL<br /><span className="outline-text">TECH SKILLS.</span></h1></div>
      <div className="hero-bottom">
        <p className="hero-copy">Structured paths. Live environments. Zero filler. Learn the systems behind modern technology by actually building them.</p>
        <Link className="hero-link" to="/posts">EXPLORE THE FIELD NOTES <Arrow diagonal /></Link>
        <Link className="hero-link" to="/paths">FOLLOW A LEARNING PATH <Arrow diagonal /></Link>
      </div>
    </section>
  </main>;
}

function NotFound() {
  return <main className="not-found" id="main"><span>ERROR 404</span>
    <h1>THIS PATH DOES NOT EXIST.</h1>
    <Link to="/">RETURN HOME <Arrow /></Link>
  </main>;
}

const router = createBrowserRouter([{
  path: "/", Component: Root, children: [
    { index: true, Component: Home },
    { path: "posts", Component: Library },
    { path: "posts/:slug", Component: Reader },
    { path: "paths", Component: Paths },
    { path: "paths/:slug", Component: Paths },
    { path: "*", Component: NotFound },
  ],
}]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
);
