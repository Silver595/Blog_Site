// Real CLI and production build against an isolated project and private-vault fixture.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { serialize } from '../publish/content.mjs';

const source = fileURLToPath(new URL('../../', import.meta.url));
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'silver-publishing-e2e-'));
const repo = path.join(temp, 'site');
const vault = path.join(temp, 'private-vault');
const meta = { title: 'TCP Handshake', description: 'A temporary verification article.', date: '2026-11-17', category: 'Networking', publish: true, draft: false };
const run = (args) => {
  const output = execFileSync(process.execPath, ['scripts/publish/index.mjs', '--vault', vault, ...args], { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  assert.ok(output.trim(), 'Publisher subprocess returned no output; check process execution permissions');
  return output;
};
try {
  await fs.mkdir(repo); await fs.mkdir(path.join(vault, 'Networking'), { recursive: true });
  await fs.mkdir(path.join(vault, 'Attachments'));
  for (const name of ['src', 'public', 'scripts', 'package.json', 'tsconfig.json', 'vite.config.ts', 'index.html']) await fs.cp(path.join(source, name), path.join(repo, name), { recursive: true });
  // The checked-out repository may already contain published Obsidian articles.
  // This fixture must start with fresh exporter-owned directories, independent of
  // the real site's committed content. Only remove copies inside the temp repo.
  await fs.rm(path.join(repo, 'src/content/posts/obsidian'), { recursive: true, force: true });
  await fs.rm(path.join(repo, 'public/media/obsidian'), { recursive: true, force: true });
  await fs.symlink(path.join(source, 'node_modules'), path.join(repo, 'node_modules'), 'dir');
  const article = path.join(vault, 'Networking/TCP.md');
  const body = '## Connection setup\n\n[[DNS#Resolution|Read about DNS]]\n\n![[Attachments/diagram.png|Network diagram]]\n\n| Step | Flag |\n| --- | --- |\n| 1 | SYN |\n\n- [x] Verified\n\n```bash\nss -tulpn\n```\n';
  await fs.writeFile(article, serialize(meta, body));
  await fs.writeFile(path.join(vault, 'DNS.md'), serialize({ ...meta, title: 'DNS' }, '## Resolution\n\nA public explanation.'));
  await fs.writeFile(path.join(vault, 'Private.md'), serialize({ ...meta, publish: false }, 'PRIVATE_BODY_SENTINEL_92f14'));
  await fs.writeFile(path.join(vault, 'Draft.md'), serialize({ ...meta, draft: true }, 'DRAFT_BODY_SENTINEL_82b34'));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  await fs.writeFile(path.join(vault, 'Attachments/diagram.png'), png);
  const output = path.join(repo, 'src/content/posts/obsidian');
  const dry = JSON.parse(run(['--dry-run']));
  assert.deepEqual(dry, { articles: 2, assets: 1, dryRun: true });
  await assert.rejects(fs.access(output));
  assert.deepEqual(JSON.parse(run([])), { articles: 2, assets: 1, dryRun: false });
  assert.deepEqual((await fs.readdir(output)).sort(), ['.publisher-owned', 'dns.md', 'tcp.md']);
  const exported = await fs.readFile(path.join(output, 'tcp.md'), 'utf8');
  assert.match(exported, /\/posts\/dns#resolution/);
  const media = exported.match(/\/media\/obsidian\/[a-f0-9]+\.png/)?.[0];
  assert.ok(media); assert.deepEqual(await fs.readFile(path.join(repo, 'public', media)), png);
  for (const [name, badBody, changes] of [
    ['private wikilink', '[[Private]]', {}],
    ['malformed metadata', body, { publish: 'true' }],
    ['path traversal', '![Escape](../../outside.png)', {}],
  ]) {
    await fs.writeFile(article, serialize({ ...meta, ...changes }, badBody));
    assert.throws(() => run(['--dry-run']), undefined, name);
    assert.throws(() => run([]), undefined, name);
    assert.equal(await fs.readFile(path.join(output, 'tcp.md'), 'utf8'), exported);
  }
  await fs.writeFile(article, serialize(meta, body));
  await fs.writeFile(path.join(vault, 'Duplicate.md'), serialize({ ...meta, slug: 'tcp' }, 'Duplicate'));
  assert.throws(() => run(['--dry-run']), undefined, 'duplicate slug dry-run');
  assert.throws(() => run([]), undefined, 'duplicate slug');
  await fs.unlink(path.join(vault, 'Duplicate.md'));
  run([]);
  execFileSync('npm', ['run', 'build'], { cwd: repo, stdio: 'inherit' });
  assert.deepEqual(await fs.readFile(path.join(repo, 'dist', media)), png);
  for (const file of await fs.readdir(path.join(repo, 'dist/assets'))) {
    if (!file.endsWith('.js')) continue;
    const bundle = await fs.readFile(path.join(repo, 'dist/assets', file), 'utf8');
    assert.doesNotMatch(bundle, /PRIVATE_BODY_SENTINEL_92f14|DRAFT_BODY_SENTINEL_82b34/);
  }
  console.log('Publishing E2E passed: 9 requested scenarios, dry-run, CLI export, media bytes, links, privacy and production build.');
} finally { await fs.rm(temp, { recursive: true, force: true }); }
