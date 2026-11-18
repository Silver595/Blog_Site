---
title: Silver Life — How I Built and Publish My Thoughts
description: A quick reference for my Obsidian-powered website, Git commands,
  publishing, and verification.
date: 2026-11-18
tags:
  - obsidian
  - git
  - github
  - vercel
  - documentation
slug: silver-life-publishing-guide
publish: true
draft: false
featured: false
---

# Silver Life — How I Built and Publish My Thoughts

I wanted a personal corner of the internet where I could write random thoughts, technical discoveries, experiments, and things worth remembering.

So I built **Silver Life**, a website powered by my Obsidian notes.

No database, no admin dashboard, and no complicated CMS. Just Markdown, Git, and a static website.

## 1. What We Built

The website uses:

| Technology   | Purpose                           |
| ------------ | --------------------------------- |
| Obsidian     | Writing and organizing thoughts   |
| Markdown     | Storing articles                  |
| React + Vite | Website frontend                  |
| TypeScript   | Application code                  |
| Node.js      | Publishing and validation scripts |
| Git + GitHub | Version control and code storage  |
| Vercel       | Hosting and automatic deployment  |

### How It Works

```text
Obsidian (Private Vault)
         |
         | publish: true
         v
Node.js Publishing CLI
         |
         | Convert Markdown
         | Resolve Wikilinks
         | Copy Referenced Images
         v
React + Vite Website
         |
         | git push
         v
       GitHub
         |
         v
   GitHub Actions
         |
         v
       Vercel
         |
         v
     Silver Life
```

Only explicitly approved notes are exported. The private Obsidian vault remains on my computer.

***

## 2. Important Locations

**Website project:**

```bash
cd /home/silver/Projects/Blog_Site
```

**Obsidian vault:**

```text
/home/silver/Documents/BlogTestVault
```

**Published Markdown output:**

```text
src/content/posts/obsidian/
```

**Published image output:**

```text
public/media/obsidian/
```

**Live website:**

<https://thoughts-lovat.vercel.app>

***

## 3. Direct Publishing Commands

These are the commands I need most often.

### A. Publish Obsidian Notes Directly

Run from the website repository:

```bash
cd /home/silver/Projects/Blog_Site

npm run publish:notes -- --vault /home/silver/Documents/BlogTestVault

git add -- src/content/posts/obsidian public/media/obsidian

git commit -m "content: publish new thoughts"

git push origin main
```

**What happens?**

1. The publisher exports approved notes.
2. Git stages the exported Markdown and media.
3. Git commits the changes.
4. GitHub receives the commit.
5. Vercel deploys the updated website.

This is the direct workflow. It does not run the full local verification suite.

### B. Push Website Code Changes Directly

Use when modifying React, CSS, TypeScript, or other website files.

```bash
cd /home/silver/Projects/Blog_Site

git add -A

git commit -m "update: website changes"

git push origin main
```

**Warning:** `git add -A` stages every changed file. Use it only after confirming nothing private or unwanted is present.

### C. Download the Latest GitHub Changes

```bash
git pull --ff-only origin main
```

Always synchronize before starting new work if changes were made or merged through GitHub.

***

## 4. Verification Commands

These commands are separate from direct publishing.

### Check Git Status

```bash
git status
```

### Inspect Changes

```bash
git diff
git diff --cached
```

### Preview Which Obsidian Notes Will Export

```bash
npm run publish:notes -- --vault /home/silver/Documents/BlogTestVault --dry-run
```

This checks the export without writing generated files.

### Run Application Tests

```bash
npm run check
```

Checks TypeScript, published content validation, and automated tests.

### Test Production Build

```bash
npm run build
```

Validates the published content and generates the production website.

### Test the Publishing Pipeline

```bash
npm run test:publishing
```

Runs the publishing end-to-end verification against a temporary test vault.

### Preview the Website Locally

```bash
npm run dev
```

Open:

<http://localhost:5173>

### Check GitHub Actions

<https://github.com/Silver595/Blog_Site/actions>

Check that the latest workflow completed successfully after pushing.

***

## 5. How to Publish a New Article

Every publishable Obsidian note needs valid frontmatter.

Example:

```yaml
---
title: My New Thought
description: Something interesting I learned today.
date: "2026-11-18"
slug: my-new-thought
tags: [thoughts, learning]
publish: true
draft: false
---
```

Write normal Markdown below the metadata.

```markdown
# My New Thought

Today I learned something interesting.

## What I Discovered

This is my explanation.

## What I Want to Remember

- First observation
- Second observation
- Important lesson
```

When the note is ready, run the direct publishing commands from Section 3.

The article will be available at:

```text
https://thoughts-lovat.vercel.app/posts/my-new-thought
```

The URL works after a successful deployment.

## 6. Keep a Note Private

To exclude a note from future exports:

```yaml
publish: false
```

Or mark it as a draft:

```yaml
draft: true
```

Then rerun the publisher and push the resulting changes.

**Important:** Unpublishing removes the article from the current website, but does not erase previous Git commits, deployment history, or cached copies.

Never publish passwords, API keys, private documents, or sensitive information.

***

## 7. My Command Cheat Sheet

| Task             | Command                              |
| ---------------- | ------------------------------------ |
| Open project     | `cd /home/silver/Projects/Blog_Site` |
| Git status       | `git status`                         |
| Get latest code  | `git pull --ff-only origin main`     |
| Stage everything | `git add -A`                         |
| Commit           | `git commit -m "message"`            |
| Push             | `git push origin main`               |
| Start website    | `npm run dev`                        |
| Run checks       | `npm run check`                      |
| Production build | `npm run build`                      |
| Publishing tests | `npm run test:publishing`            |

## Final Thought

The purpose of Silver Life isn't to build another complicated platform.

It's to have a place where I can write freely, document what I learn, preserve useful discoveries, and revisit them whenever my memory fails.

**Write in Obsidian. Publish with Git. Keep learning.**
