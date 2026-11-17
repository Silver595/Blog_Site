import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';
import { frontmatter, metadata } from '../publish/content.mjs';
import { parseMarkdown, walk, nodeText } from '../publish/markdown.mjs';

async function files(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Symlink in public content: ${entry.name}`);
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(file));
    else if (entry.name.endsWith('.md')) result.push(file);
  }
  return result;
}
export async function validate(repo) {
  const posts = new Map();
  for (const file of await files(path.join(repo, 'src/content/posts'))) {
    const { data, body } = frontmatter(await fs.readFile(file, 'utf8'), file);
    if (data.publish !== true || data.draft === true) throw new Error(`Unapproved note in public repository: ${file}`);
    const meta = metadata(data, path.basename(file));
    if (meta.slug !== path.basename(file, '.md')) throw new Error(`File name must match slug: ${file}`);
    if (posts.has(meta.slug)) throw new Error(`Duplicate slug: ${meta.slug}`);
    const tree = parseMarkdown(body); const headings = new Set(); const slugger = new GithubSlugger();
    walk(tree, node => { if (node.type === 'heading') headings.add(slugger.slug(nodeText(node))); });
    posts.set(meta.slug, { file, tree, headings, cover: data.cover });
  }
  for (const [slug, post] of posts) {
    const urls = []; const definitions = new Set(); const references = [];
    walk(post.tree, node => {
      if (node.type === 'html') throw new Error(`${slug}: raw HTML is unsupported`);
      if (node.type === 'text' && /!?\[\[.*?\]\]/.test(node.value)) throw new Error(`${slug}: unconverted wikilink`);
      if (['link', 'image', 'definition'].includes(node.type)) urls.push(node.url);
      if (node.type === 'definition') definitions.add(node.identifier);
      if (['linkReference', 'imageReference'].includes(node.type)) references.push(node.identifier);
    });
    if (references.some(id => !definitions.has(id))) throw new Error(`${slug}: undefined Markdown reference`);
    if (post.cover) urls.push(post.cover);
    for (const url of urls) {
      if (/^https?:\/\//i.test(url)) { new URL(url); continue; }
      if (/^mailto:/i.test(url)) continue;
      if (url === '/' || url === '/posts') continue;
      if (url.startsWith('#') || url.startsWith('/posts/')) {
        const [target, anchor] = url.split('#');
        const linked = posts.get(target ? target.slice('/posts/'.length) : slug);
        if (!linked || (anchor && !linked.headings.has(decodeURIComponent(anchor)))) throw new Error(`${slug}: broken article link: ${url}`);
      } else if (url.startsWith('/media/')) {
        const relative = decodeURIComponent(url.split('#')[0]);
        const root = path.join(repo, 'public/media');
        const file = path.resolve(repo, 'public', '.' + relative);
        if (!file.startsWith(root + path.sep)) throw new Error(`${slug}: unsafe asset path`);
        const real = await fs.realpath(file);
        if (real !== file || !(await fs.stat(file)).isFile()) throw new Error(`${slug}: unsafe asset: ${url}`);
      } else throw new Error(`${slug}: unsupported or unresolved URL: ${url}`);
    }
  }
  return posts.size;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(`Validated ${await validate(fileURLToPath(new URL('../../', import.meta.url)))} articles`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
