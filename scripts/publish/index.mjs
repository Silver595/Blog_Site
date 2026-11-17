import fs from 'node:fs/promises';
import path from 'node:path';
import GithubSlugger, { slug as headingSlug } from 'github-slugger';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { frontmatter, metadata, serialize } from './content.mjs';
import { parseMarkdown, printMarkdown, walk, wikiLinks, nodeText } from './markdown.mjs';

const extensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.pdf']);
const inside = (root, file) => file === root || file.startsWith(root + path.sep);
async function filesUnder(root, dir = root) {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) files.push(...await filesUnder(root, file));
    else if (entry.isFile()) files.push(file);
  }
  return files.sort();
}
async function safeOutput(repo, relative) {
  let current = repo;
  for (const segment of relative.split('/')) {
    current = path.join(current, segment);
    try { if ((await fs.lstat(current)).isSymbolicLink()) throw new Error(`Output symlink forbidden: ${relative}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return current;
}
export async function publish({ vault, repo, dryRun = false }) {
  vault = await fs.realpath(vault); repo = await fs.realpath(repo);
  if (inside(repo, vault) || inside(vault, repo)) throw new Error('Vault and repository must be separate, non-nested directories');
  const files = await filesUnder(vault);
  const notes = [];
  for (const file of files.filter(file => /\.md$/i.test(file))) {
    const parsed = frontmatter(await fs.readFile(file, 'utf8'), path.relative(vault, file));
    if (parsed.data.publish === true && parsed.data.draft !== true) notes.push({ file, ...parsed, meta: metadata(parsed.data, path.basename(file)) });
  }
  const slugs = new Set();
  for (const note of notes) {
    if (slugs.has(note.meta.slug)) throw new Error(`Duplicate slug: ${note.meta.slug}`);
    slugs.add(note.meta.slug);
  }
  const postsRoot = 'src/content/posts';
  const outputRoot = `${postsRoot}/obsidian`;
  const mediaRoot = 'public/media/obsidian';
  const output = await safeOutput(repo, outputRoot);
  const media = await safeOutput(repo, mediaRoot);
  // Check collisions with handwritten posts before changing any generated files.
  for (const file of await filesUnder(path.join(repo, postsRoot))) {
    if (!inside(output, file) && /\.md$/i.test(file) && slugs.has(path.basename(file, '.md'))) throw new Error(`Slug collides with existing article: ${path.basename(file)}`);
  }
  for (const note of notes) {
    note.headings = new Set(); const slugger = new GithubSlugger();
    const headingsTree = parseMarkdown(note.body); wikiLinks(headingsTree);
    walk(headingsTree, node => { if (node.type === 'heading') note.headings.add(slugger.slug(nodeText(node))); });
  }
  const approved = new Map(notes.map(note => [note.file, note]));
  const assets = new Map(); const articles = new Map();
  function locate(url, source, wiki) {
    let decoded;
    try { decoded = decodeURIComponent(url); } catch { throw new Error(`Invalid URL encoding in ${path.basename(source)}`); }
    if (decoded.includes('\\') || decoded.includes('\0') || path.isAbsolute(decoded)) throw new Error(`Absolute or unsafe local path: ${url}`);
    const relative = path.resolve(path.dirname(source), decoded);
    if (!inside(vault, relative) || decoded.split('/').some(part => part.startsWith('.') && part !== '.' && part !== '..')) throw new Error(`Outside approved scope or hidden path: ${url}`);
    const candidates = [relative, relative + '.md'];
    if (wiki) candidates.push(path.resolve(vault, decoded), path.resolve(vault, decoded + '.md'));
    const exact = [...new Set(candidates)].filter(file => files.includes(file));
    if (exact.length === 1) return exact[0];
    if (!exact.length && wiki && !decoded.includes('/')) {
      const matches = files.filter(file => path.basename(file) === decoded || path.basename(file) === decoded + '.md');
      if (matches.length === 1) return matches[0];
    }
    throw new Error(`Missing or ambiguous local reference in ${path.basename(source)}: ${url}`);
  }
  async function resolve(url, note, wiki, image) {
    if (/^https?:\/\//i.test(url)) { new URL(url); return url; }
    if (!image && /^mailto:/i.test(url)) return url;
    if (url.startsWith('#')) {
      const anchor = wiki ? headingSlug(decodeURIComponent(url.slice(1))) : decodeURIComponent(url.slice(1));
      if (!note.headings.has(anchor)) throw new Error(`Missing heading: ${url}`);
      return '#' + anchor;
    }
    if (/^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith('//')) throw new Error(`Unsafe URL: ${url}`);
    const split = url.indexOf('#'); const target = split < 0 ? url : url.slice(0, split);
    const fragment = split < 0 ? '' : url.slice(split);
    if (target.includes('?')) throw new Error(`Local query strings are unsupported: ${url}`);
    const file = locate(target, note.file, wiki);
    if (/\.md$/i.test(file)) {
      if (image) throw new Error('Note transclusion is unsupported; use a link to an approved note');
      const linked = approved.get(file);
      if (!linked) throw new Error(`Link targets an unpublished note in ${path.basename(note.file)}; remove the link or explicitly approve its target`);
      const anchor = fragment ? '#' + (wiki ? headingSlug(decodeURIComponent(fragment.slice(1))) : decodeURIComponent(fragment.slice(1))) : '';
      if (anchor && !linked.headings.has(anchor.slice(1))) throw new Error(`Missing heading: ${url}`);
      return `/posts/${linked.meta.slug}${anchor}`;
    }
    const ext = path.extname(file).toLowerCase();
    if (!extensions.has(ext)) throw new Error(`Attachment type not approved: ${ext}`);
    if (image && ext === '.pdf') throw new Error('PDF embeds unsupported; use an ordinary link');
    const real = await fs.realpath(file);
    if (!inside(vault, real) || real !== file) throw new Error('Attachment symlink or path escape rejected');
    const bytes = await fs.readFile(file);
    if (bytes.length > 20 * 1024 * 1024) throw new Error('Attachment exceeds 20 MiB');
    const name = createHash('sha256').update(bytes).digest('hex') + ext;
    assets.set(name, bytes);
    return `/media/obsidian/${name}${fragment}`;
  }
  for (const note of notes) {
    const tree = parseMarkdown(note.body); wikiLinks(tree);
    const imageDefinitions = new Set();
    walk(tree, node => { if (node.type === 'imageReference') imageDefinitions.add(node.identifier); });
    const references = []; walk(tree, node => {
      if (node.type === 'text' && node.value.includes('%%')) throw new Error('Obsidian comments are unsupported; remove private annotations before export');
      if (node.type === 'html') throw new Error(`${path.basename(note.file)}: raw HTML is unsupported; use Markdown links`);
      if (['link', 'image', 'definition'].includes(node.type)) references.push(node);
    });
    for (const node of references) node.url = await resolve(node.url, note, node.wiki, node.type === 'image' || imageDefinitions.has(node.identifier));
    if (note.data.cover !== undefined) {
      if (typeof note.data.cover !== 'string') throw new Error('cover must be a local image path or HTTPS URL');
      note.meta.cover = await resolve(note.data.cover, note, true, true);
    }
    articles.set(`${note.meta.slug}.md`, serialize(note.meta, printMarkdown(tree)));
  }
  // These dedicated directories are exporter-owned. Refuse adoption of existing content.
  const marker = '.publisher-owned';
  for (const directory of [output, media]) {
    try {
      const entries = await fs.readdir(directory);
      if (entries.length && !entries.includes(marker)) throw new Error(`Refusing to overwrite unmanaged directory: ${directory}`);
      for (const entry of entries) if (!(await fs.lstat(path.join(directory, entry))).isFile()) throw new Error('Output must contain only regular files');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  if (!dryRun) {
    // All parsing and validation finishes before mutation. Per-file rename prevents partial files.
    for (const [directory, entries] of [[output, articles], [media, assets]]) {
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(path.join(directory, marker), 'Owned by npm run publish:notes. Do not edit.\n');
      for (const [name, bytes] of entries) {
        const temp = path.join(directory, `.${randomUUID()}.tmp`);
        await fs.writeFile(temp, bytes, { flag: 'wx' });
        await fs.rename(temp, path.join(directory, name));
      }
      for (const name of await fs.readdir(directory)) if (name !== marker && !entries.has(name)) {
        const file = path.join(directory, name);
        if (!(await fs.lstat(file)).isFile()) throw new Error(`Unexpected directory in managed output: ${name}`);
        await fs.unlink(file);
      }
    }
  }
  return { articles: articles.size, assets: assets.size, dryRun };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); let vault; let dryRun = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--vault' && args[i + 1] && !args[i + 1].startsWith('--')) vault = args[++i];
      else if (args[i] === '--dry-run') dryRun = true;
      else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
    }
    if (!vault) throw new Error('Usage: npm run publish:notes -- --vault /absolute/private/vault [--dry-run]');
    console.log(JSON.stringify(await publish({ vault, repo: fileURLToPath(new URL('../../', import.meta.url)), dryRun })));
  } catch (error) { console.error(`Publish failed: ${error.message}`); process.exitCode = 1; }
}
