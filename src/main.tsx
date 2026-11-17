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
      <svg className="hero-architecture" viewBox="0 0 1000 760" preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden="true" focusable="false">
        <g className="architectural-guides">
          <path d="M110 714V154M890 714V154M46 714H954M46 154H954M110 154L500 28 890 154" />
          <path d="M46 685H954M46 672H954M122 714V154M878 714V154" />
          <path d="M500 28V714M110 154L500 714M890 154L500 714" strokeDasharray="3 14" />
          <circle cx="500" cy="28" r="7" /><circle cx="500" cy="714" r="5" />
        </g>
        <g className="architectural-masonry">
          <path d="M215 645V277A285 285 0 0 1 785 277V645" />
          <path d="M250 645V277A250 250 0 0 1 750 277V645" />
          <path d="M291 645V277A209 209 0 0 1 709 277V645" />
          <path d="M335 645V277A165 165 0 0 1 665 277V645" />
          <path d="M380 645V277A120 120 0 0 1 620 277V645" />
          <path d="M435 645V277A65 65 0 0 1 565 277V645" />
          <path d="M185 645H815M185 663H815M185 677H815" />
        </g>
      </svg>
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
