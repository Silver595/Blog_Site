# Silver Life — independent technical knowledge website

This repository is the **standalone** website for the Silver Life knowledge library, based on the supplied Figma design. It is **not** part of the portfolio site.

## Stack

React 19, React Router, Vite, Tailwind CSS 4, TypeScript, React Markdown, YAML. Static site: no MongoDB, Express API, user accounts or runtime database.

## Local development

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Publish Markdown from Obsidian

Create a **separate public publishing folder or vault**; never sync your private vault to this public repo.

Add approved Markdown files under `src/content/posts/`. Every article needs YAML frontmatter:

```yaml
---
title: How DNS resolution works
description: A practical walkthrough of DNS.
date: 2026-11-17
category: Networking
tags: [dns, networking]
featured: false
publish: true
---
```

Articles marked `publish: true` are displayed, unless `draft: true` is also set. Important: an unpublished file in a **public repository is still publicly readable**, so do not commit personal notes.

Use standard Markdown syntax for links, code blocks, tables and images. Put public images under `public/media/` and link them using `![Alt](/media/filename.png)`.

The website loads posts at **build time**. New or edited Markdown files require a new Git commit and Vercel build. Obsidian's `[[wikilinks]]` and `![[embedded files]]` are not yet converted; use standard Markdown in published notes.

## GitHub → Vercel deployment

In Vercel, create a project and import `Silver595/Blog_Site`. Framework: **Vite**; root directory: `./`; build command: `npm run build`; output directory: `dist`. Pushes to `main` should trigger deployment when Vercel is connected.

## Planned automation

- Obsidian-approved note exporter and media copying
- Selective publication without exposing private notes
- Tests for frontmatter, local assets and internal links
- Optional search, tags, RSS and sitemap

The initial migration replaces the former Express/MongoDB application. Previous commits remain available for recovery.
