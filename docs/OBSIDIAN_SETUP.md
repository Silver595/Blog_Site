# Obsidian → Silver Life

The publishing CLI, private-vault fixture, and production build passed in
[GitHub Actions](https://github.com/Silver595/Blog_Site/actions/runs/44053395396). See [FINAL_VERIFICATION.md](FINAL_VERIFICATION.md).

## One-time setup (Omarchy / Arch Linux)

Use your installed terminal and Obsidian. No desktop configuration or Obsidian
plugin is required. Install Git and a supported Node.js version if missing:

```bash
sudo pacman -S --needed git nodejs npm
git clone https://github.com/Silver595/Blog_Site.git
cd Blog_Site
node --version  # Node 22.12+; CI uses Node 22
npm ci
npm run check
npm run build
```

The committed lockfile and temporary Rollup 4.68.4 override make installation
reproducible. Use `npm ci`; review dependency updates separately.
Keep your private vault outside the repository, for example
`/home/silver/Documents/Knowledge`. Never symlink or copy the vault into the repo.
Do not put `.obsidian`, credentials, or unpublished notes anywhere in this repo.
Gitignore cannot protect files already tracked or published in history.

## Author an approved note

Create `Networking/TCP Handshake.md` in Obsidian:

```yaml
---
title: Understanding TCP Three-Way Handshake
description: How TCP establishes a reliable connection.
date: 2026-11-17
category: Networking
tags: [TCP, Transport Layer, Networking]
slug: tcp-handshake
publish: true
draft: false
---
```

Write the article below the closing delimiter. `publish: true` must be a YAML
boolean, not the string `"true"`. Missing/false publish or true draft excludes the
note. Malformed YAML or boolean flags stop the run. Title, description, date and
category are required for approved notes. Date is a real ISO calendar date.

An explicit slug is recommended: it preserves the URL when you rename the note.
Otherwise the filename determines the slug, independently of the title and folder.
Use lowercase ASCII words separated by hyphens. Duplicate slugs stop the run.
Personal frontmatter fields are discarded, but the entire approved note body is
public. Review its text, code, images, and PDF metadata for secrets before approval.

## Links and attachments

Supported examples:

```markdown
[[DNS Basics]]
[[Networking/DNS Basics#Resolution|How DNS works]]
[DNS](../Networking/DNS%20Basics.md#resolution)
![[Attachments/tcp.png|TCP handshake diagram]]
![TCP handshake diagram](../Attachments/tcp.png)
[Download the diagram](../Attachments/tcp.pdf)
```

Ordinary paths resolve relative to the note. Wikilinks try note-relative then
vault-relative paths and unique filenames. Ambiguous names fail; use full paths.
Both ends of an article link must be approved and non-draft. Links to unpublished
notes fail without exporting them; remove the link or explicitly approve the
other note. Heading anchors are checked. Block references and note transclusion
(`![[Another Note]]`) are not supported.

Referencing a file from an approved note explicitly approves copying that file.
Only PNG, JPEG, WebP, GIF, AVIF and PDF files up to 20 MiB are allowed. Use a normal
link for PDFs. Filenames become content hashes; duplicate bytes share an asset.
Hidden folders (including `.obsidian`), symbolic links, paths outside the vault,
SVG/HTML/scripts and arbitrary attachments are excluded/rejected. Use descriptive
image alt text; image sizing aliases such as `|300` are not implemented.

GFM tables, task lists, lists, blockquotes, headings and code blocks are preserved.
Wikilinks inside code stay literal. Obsidian comments (`%%...%%`) are rejected in
text to avoid unintentionally exposing annotations. Raw HTML is rejected. Mermaid
fences and math remain source text for now. Use normal HTTPS links to YouTube or
other media; there is no iframe or arbitrary HTML execution.

## Publish deliberately

Run from the website checkout:

```bash
npm run publish:notes -- --vault /home/silver/Documents/Knowledge --dry-run
npm run publish:notes -- --vault /home/silver/Documents/Knowledge
npm run check
npm run build
npm run dev
```

Visit the local URL printed by Vite, then `/posts` and `/posts/tcp-handshake`.
Dry-run performs resolution/validation without writing any files. Errors produce
a nonzero exit status. The publisher validates the whole plan before writing;
files are individually renamed, not one filesystem transaction across both
folders. If interrupted or disk space runs out, rerun and validate before commit.
Do not run multiple publishers simultaneously. Stop editing the vault during export.

The two folders below are entirely exporter-owned. Do not edit them by hand or
use different vaults against the same output: each run reconciles the complete
approved set and deletes obsolete generated notes/assets.

```bash
git diff -- src/content/posts/obsidian public/media/obsidian
git status --short
git add src/content/posts/obsidian public/media/obsidian
git diff --cached --stat
git diff --cached -- src/content/posts/obsidian
git commit -m "content: publish TCP handshake article"
git push origin main
```

Review images/PDFs separately because Git's textual diff cannot inspect them.
The exporter deliberately never stages, commits, or pushes on your behalf.
Vercel's existing Git integration should deploy the push; check the deployment
status in your Vercel project and then open the article on the live site. This
implementation has not verified account settings or performed a deployment.

If branch protection requires PRs, push a content branch and merge after CI passes.
In GitHub Settings → Branches/Rulesets, make `Validate / check` required for main.
No Vercel token or duplicate deployment workflow is needed.

## Unpublish

Set `publish: false` or `draft: true`, remove incoming links from approved notes,
and rerun the publisher, checks and commit/push sequence. It removes generated
copies and unused media. Previously published content remains in Git history,
deployment history and caches: unpublishing cannot make it private retroactively.

## Tests and troubleshooting

`npm test` includes a temporary private-vault integration scenario with approved
and private/draft notes, images/PDFs, links, dry-run, revocation, path attacks,
symlinks and slug collisions. Fixtures live under the OS temporary directory and
are cleaned afterward. No real vault is read by tests.

- Missing/ambiguous link: correct its path or use a unique full vault path.
- Private target: remove the link; do not publish unrelated notes just to pass.
- Unmanaged output: move your handwritten files elsewhere; the CLI refuses to
  adopt a nonempty directory without its ownership marker.
- Install DNS error: restore access to registry.npmjs.org, rerun npm install,
  then all checks. Do not bypass failing checks or push unverified exports.
