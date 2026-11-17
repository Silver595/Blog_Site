# Knowledge library milestone

`/posts` is now a searchable, topic-filtered library. Existing `/posts/:slug` URLs
and the Obsidian exporter are unchanged. The homepage links to the library.

## Index and filters

`src/lib/library.mjs` is the shared pure indexing/filtering layer. It accepts only
explicit boolean `publish: true` with an absent/false draft flag. The existing
build validator and content loader still reject unapproved files in public content.
This is defense in depth, not permission to store private notes in this repository.

The browser builds the index once from approved article data. Markdown is parsed
with the existing unified/remark dependencies. Search covers title, description,
tags, category and body (including code), matching all entered terms without case
or accent sensitivity. The input is debounced by 250 ms. Filters persist in `q`
and `topic` URL parameters. Results are native keyboard-focusable links.

Seven requested topic labels are shown even when empty. Counts and membership come
from article category metadata; additional categories appear automatically. AWS
and Cloud normalize to Cloud & AWS. There are no hardcoded article collections.

## Reader

The reader estimates time at 200 words/minute and derives the TOC from actual
Markdown headings using the same GitHub slug algorithm as rendering. Repeated
heading titles get unique IDs. Code and inline-code examples do not create headings.
Markdown h1 is displayed as h2 under the article title. Images fit the available
width; tables and code scroll independently. Related articles rank shared tags
above a shared category; previous/next use the existing newest-first article order.

Prism 1.30.0 is vendored locally with its MIT license and provenance in
`src/vendor/README.md`, because npm registry access was unavailable to the agent.
No npm dependencies were added. Included grammars: JavaScript, Bash, Python, JSON,
YAML, CSS, and the clike base. Other languages and code blocks over 30,000 characters
render as plain text. Code remains React text or Prism-escaped HTML. Raw Markdown
HTML remains disabled. Copy reports clipboard success/failure via a live region.

Library and reader routes are lazy-loaded. The final production build no longer
emits the initial large-chunk warning. No framework, backend, or deployment change.

## Verification

- `npm run check`: passed (TypeScript, content validation, tests).
- `node --test --test-isolation=none tests/*.test.mjs`: 32 passed, 0 failed.
  Includes search, categories, private/draft exclusion, heading IDs, reading time,
  related ranking, HTML escaping, metadata and existing publisher integration tests.
- `npm run build`: passed, one existing public article validated.
- Chromium browser smoke: 12 checks passed at each of 390×844, 768×1024 and
  1440×1000 (36 checks): library loading, overflow, focus, body search, empty states,
  URL filters, article routing/title, TOC targets and copy control/handler.
  Clipboard was mocked to check copied text; OS clipboard permission was not tested.
- Visually inspected mobile library and desktop reader screenshots.

The local sandbox blocked the CLI/build harness subprocesses. It subsequently
passed in [GitHub Actions](https://github.com/Silver595/Blog_Site/actions/runs/44053395396) on Node 22, together with npm ci, all 32 tests, and the production build.

There is only one real article, so most topics are currently empty and the live
article has no related/previous/next links. Related ranking uses test fixtures.
Search is intentionally in-memory; consider a generated search index if corpus
size grows substantially. No deployment was performed for this milestone.

Infrastructure changes (Rollup override/lockfile, CI, ignore rules, publisher
regression and CLI harness) were finalized separately in commit `46740ed`.
