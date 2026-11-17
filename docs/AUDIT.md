# Repository audit — 2026-11-17

Audited all 12 tracked files at upstream `710b89844bac6608328b48e280551c679e4b56ad`.
Direct clone failed (GitHub DNS unavailable). Retrieved the exact source through the
GitHub connector, reconstructed the unsigned upstream commit, and verified both
its Git object SHA and tree SHA. This is a shallow checkout of the existing project,
not a replacement project or unrelated history.

## Confirmed source findings

- npm scripts, but no lockfile or package manager declaration. React 19, React
  Router 7, Vite 7, TypeScript, Tailwind 4, react-markdown, YAML, GFM, rehype-slug.
  These are manifest ranges; installed versions could not be established.
- `src/main.tsx` owns all four routes: home, posts, post slug, catch-all 404.
  Home/list/article/back/GitHub navigation is wired in source. ABOUT is explicitly
  upcoming, not a working page. Browser interaction is not yet verified.
- `src/content.ts` eagerly imports every Markdown file under posts. Filtering
  `publish` in the browser is not a privacy boundary: source files remain public
  in Git and can enter the JavaScript bundle. Changed to fail on unapproved files;
  added a mandatory build validation step. Only the exporter should bring vault
  content into this repository.
- YAML parsing existed, but metadata coercion was permissive. No exporter,
  attachment copying, wikilink resolution, validation script, tests or CI existed.
- The monochrome/lime design and responsive breakpoints live in `src/index.css`.
  Mobile closed navigation used opacity alone, leaving invisible links focusable.
  Added visibility gating. Tables already scroll and images already scale.
- Markdown has GFM and heading IDs. Raw HTML is not executed by react-markdown.
  Code highlighting/copy, TOC, reading time, related/previous/next, search, categories
  and tag browsing are not implemented. Unsupported embeds must remain safe links
  or code blocks for now.
- Public assets are static. There is one welcome post and an SVG favicon; no real
  article media or optimization pipeline. Google Fonts remains a third-party fetch.
- `vercel.json` supplies SPA fallback, excluding assets/media/favicon. Preserved.
  Unknown routes render a client 404 but likely retain HTTP 200 under the rewrite.
- `index.html` provides generic metadata only. Client rendering is inadequate for
  dependable article social previews. Recommend build-time prerendering of known
  routes next, without a framework migration, then RSS/sitemap/canonicals/OG.

## Implemented first increment

Local explicit export into dedicated `src/content/posts/obsidian` and
`public/media/obsidian` folders; private vault stays outside the repository.
AST Markdown processing uses unified/remark instead of regex Markdown parsing.
The small wikilink conversion only visits text nodes, preserving code examples.
Strict boolean approval/draft flags; metadata allowlist; stable filename or explicit
slugs; collisions fail; relative paths and URL decoding checked; hidden files and
symlinks excluded; only referenced raster images/PDFs copied. Private and missing
links fail the whole plan. Export does not commit or push automatically.
Generated content removed on revocation; this does not erase prior public history.

The validator checks publication flags, metadata, slug collisions, local article
anchors and assets. CI runs it, tests, typecheck and build. Required-check branch
protection still needs configuring in GitHub; a workflow file alone does not block
merges. Vercel's existing integration remains responsible for deployment.

## Verification and limits

Node v26.13.0 and npm 12.2.1 were available. `npm install` failed with EAI_AGAIN for
registry.npmjs.org; offline installation failed because required packages are not
cached. Full `npm test`, `npm run typecheck`, and `npm run build` were attempted and
blocked by missing dependencies. No lockfile was fabricated. Metadata tests passed
using the already installed local YAML package; script syntax checks passed.
Publisher integration tests, temporary-vault end-to-end execution, production build
and browser interactions remain unverified until installation succeeds.
The live URL also could not be fetched in this environment. No deployment claim.

## Next implementation order

1. Restore npm registry access; install, generate/commit lockfile, run all checks,
   temporary-vault export, production build, and browser smoke test. Switch CI to
   npm ci and make its check required before merging.
2. Add article typography refinements, highlighting/copy, TOC, reading time,
   previous/next and accessible heading links within the current design.
3. Categories, tags, static search and related articles.
4. Prerender article routes and implement SEO feeds/metadata and true HTTP 404s.
5. Add Mermaid/math and tightly allowlisted media rendering with dedicated tests.
