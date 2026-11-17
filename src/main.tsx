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
      <span className="brand-mark">SL.</span><span>SILVER LIFE</span>
    </Link>
    <nav className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="Main navigation">
      <Link to="/" onClick={closeMenu}>HOME</Link>
      <Link to="/posts" onClick={closeMenu}>POSTS</Link>
      <Link to="/paths" onClick={closeMenu}>LEARNING PATHS</Link>
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
      <div className="hero-heading-wrap"><h1>Wellcome the <span className="outline-text">Trash of thought.</span></h1></div>
      <div className="hero-bottom">
        <p className="hero-copy">the collection of random,un scripted thoughts I share here</p>
        <Link className="hero-link" to="/posts">READ THE THOUGHTS <Arrow diagonal /></Link>
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
