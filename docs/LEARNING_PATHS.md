# Learning paths

Learning paths are automatically assembled from **published** Markdown article metadata. They never read the private Obsidian vault directly.

Add two fields to an approved Obsidian note:

```yaml
learningPath: Networking Foundations
lesson: 1
```

Both values are required together. `learningPath` must be a nonempty string and `lesson` a positive integer. The exporter preserves them through its explicit frontmatter allowlist. A learning path appears at `/paths`; its ordered lessons appear at `/paths/networking-foundations`.

- Add lessons using unique numeric order within a path.
- Existing article URLs stay unchanged.
- Only publicly approved articles enter the learning path.
- Avoid changing the path name after publishing; it changes the path URL.
- The starter path includes two original instructional notes about DNS and TCP.
- Validate before merging: `npm ci && npm run check && npm run build && npm run test:publishing`.

There is no account system or progress tracker. This remains a static website.
