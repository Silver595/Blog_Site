# Obsidian publishing — practical workflow

Your private Obsidian vault stays **outside** this public GitHub repository. Only notes with explicit `publish: true` (and not `draft: true`) are exported. The author controls every public publication.

## 1. Local setup

In Omarchy, install Obsidian, Git, and Node.js 22.12+ or another supported version. Use the existing checkout:

```bash
cd /home/silver/Projects/Blog_Site
git pull --ff-only origin main
npm ci
```

Keep your Obsidian vault at a separate absolute path, e.g. `/home/silver/Documents/Knowledge`. Find the actual path using your file manager. Never store your vault under `Blog_Site`.

## 2. Create a real note in Obsidian

Create a note called `First Published Note.md` in your vault and add exactly this metadata at the top:

```yaml
---
title: My First Obsidian Article
description: Testing the connection from Obsidian to my website.
date: "2026-11-17"
slug: first-obsidian-article
tags: [testing, obsidian]
publish: true
draft: false
---
```

Then add ordinary Markdown:

```markdown
# My First Obsidian Article

This text was written in Obsidian.

## A code block

\`\`\`bash
echo "Hello from Obsidian"
\`\`\`
```

**Category is optional.** If you use images, insert them normally with Obsidian embeds like `![[photo.png]]` or Markdown `![Alt](attachments/photo.png)`. The CLI copies only referenced allowed images. For internal wikilinks, the target must also be explicitly approved for publication.

## 3. Export safely

From the website repository:

```bash
npm run publish:site -- --vault /home/silver/Documents/Knowledge --dry-run
npm run publish:site -- --vault /home/silver/Documents/Knowledge
```

Replace the example vault path with your **actual** vault path.

The first command inspects approved notes, links, and assets without writes. The second exports them, runs TypeScript checks, content validation, automated unit tests, and a production build. By default it does **not** make a Git commit or push.

Visit `http://localhost:5173/posts/first-obsidian-article` after starting `npm run dev` to preview your article. If the CLI reports a conflict, fix the note; do not bypass the safety checks.

## 4. Review what would become public

```bash
git status --short
git diff -- src/content/posts/obsidian
git diff --stat
```

Inspect any newly created Markdown files using your editor (untracked files will not appear in `git diff`) and **inspect images and PDFs individually**; Git diff does not reveal embedded private information or file metadata. Confirm that no personal tokens, addresses, credentials, or private material appear.

## 5. Commit and publish

Once reviewed:

```bash
npm run publish:site -- --vault /home/silver/Documents/Knowledge --commit --push
```

The command requires a clean Git working tree when it starts. If the earlier export left changes, review them, then use the manual Git workflow below instead. This is intentional: automatic commits must not scoop up unrelated local changes.

For the usual review-first workflow:

```bash
git add -- src/content/posts/obsidian public/media/obsidian
git diff --cached --stat
git diff --cached -- src/content/posts/obsidian
git commit -m "content: publish approved Obsidian notes"
git push origin main
```

With a Vercel Git integration, a successful push should trigger deployment. Check GitHub Actions and Vercel, then visit:

`https://thoughts-lovat.vercel.app/posts/first-obsidian-article`

Do **not** assume that a local build means the remote deployment has completed.

## Updates and unpublishing

Edit a note in Obsidian, then rerun the dry-run, export, checks, review and Git sequence.

Setting `publish: false` (or `draft: true`) removes an exported note on the next run. Links from other approved notes must be updated first. The generated `obsidian` directories are exporter-owned and reconciled on each run. An unpublish does **not** erase earlier Git commits, deployed bundles, mirrors, or caches. Never publish secrets even temporarily.

## Limitations

The exporter currently rejects HTML, unsupported file extensions, ambiguous links, links to private notes, path escapes, and unsupported Obsidian transclusions. Mermaid/math rendering and rich video embeds are not implemented. Normal HTTPS links work. All static articles are public once deployed.

No backend, paid CMS, external publish token, or Obsidian plugin is required.
