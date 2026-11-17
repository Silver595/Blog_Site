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

## Publish from a private Obsidian vault

Follow [the setup and publishing guide](docs/OBSIDIAN_SETUP.md). The vault stays
outside the repository. The local CLI exports only explicitly approved, non-draft
notes and their referenced approved media; it never commits or pushes for you.

```bash
npm run publish:notes -- --vault /absolute/path/to/private/vault --dry-run
npm run publish:notes -- --vault /absolute/path/to/private/vault
npm run check
npm run build
```

Review the generated files, commit them, and push to the existing Vercel-connected
GitHub repository. See [the audit](docs/AUDIT.md) for verified findings, remaining
features and current environment verification limits. No database or CMS is needed.

## Knowledge library

Browse `/posts` to search article text or filter topics. Articles include a table
of contents, reading time, highlighted/copyable code, related notes and adjacent
article navigation. See [implementation and verification notes](docs/KNOWLEDGE_LIBRARY.md).
