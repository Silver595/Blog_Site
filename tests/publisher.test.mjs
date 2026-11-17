import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { publish } from '../scripts/publish/index.mjs';
import { validate } from '../scripts/validate/content.mjs';
import { serialize } from '../scripts/publish/content.mjs';
const base = { title: 'TCP', description: 'TCP explained', date: '2026-11-17', category: 'Networking', publish: true };
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'obsidian-publisher-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const vault = path.join(root, 'vault'), repo = path.join(root, 'repo');
  await fs.mkdir(vault); await fs.mkdir(path.join(repo, 'src/content/posts'), { recursive: true });
  const write = async (name, body = '## Hello\n\nPublic body', meta = {}) => {
    const file = path.join(vault, name); await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, serialize({ ...base, ...meta }, body));
  };
  const output = path.join(repo, 'src/content/posts/obsidian');
  return { root, vault, repo, write, output };
}
test('end-to-end: recursive approved export, media, links, GFM, code, validation and revoke', async t => {
  const f = await fixture(t);
  await f.write('Guides/TCP.md', '## Hello\n\n[[Other#Hello|Read more]]\n\n![[diagram.png|Diagram]]\n\n[PDF](../manual.pdf)\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n- [x] Done\n\n```text\n[[Private]]\n```\n\n`[[Private]]`');
  await f.write('Other.md');
  await f.write('Private.md', 'PRIVATE_SENTINEL', { publish: false });
  await f.write('Draft.md', 'DRAFT_SENTINEL', { draft: true });
  await fs.writeFile(path.join(f.vault, 'diagram.png'), Buffer.from('89504e470d0a1a0a', 'hex'));
  await fs.writeFile(path.join(f.vault, 'manual.pdf'), '%PDF-1.4');
  const result = await publish(f); assert.equal(result.articles, 2); assert.equal(result.assets, 2);
  const content = await fs.readFile(path.join(f.output, 'tcp.md'), 'utf8');
  assert.match(content, /\/posts\/other#hello/); assert.match(content, /\/media\/obsidian\/.*\.png/);
  assert.match(content, /\[\[Private\]\]/); assert.match(content, /\[x\]/);
  assert.deepEqual((await fs.readdir(f.output)).sort(), ['.publisher-owned', 'other.md', 'tcp.md']);
  assert.equal(await validate(f.repo), 2);
  await f.write('Guides/TCP.md', 'Private now', { publish: false });
  await publish(f); assert.equal(await validate(f.repo), 1);
  assert.deepEqual(await fs.readdir(path.join(f.repo, 'public/media/obsidian')), ['.publisher-owned']);
});
test('dry-run writes nothing', async t => {
  const f = await fixture(t); await f.write('TCP.md');
  assert.equal((await publish({ ...f, dryRun: true })).articles, 1);
  await assert.rejects(fs.access(f.output));
});
for (const [name, body] of [
  ['private target', '[[Private]]'], ['ordinary private link', '[private](Private.md)'],
  ['traversal', '![secret](../outside.png)'], ['encoded traversal', '![secret](%2e%2e/outside.png)'],
  ['absolute path', '![secret](/etc/passwd)'], ['hidden file', '[secret](.obsidian/settings.json)'],
  ['unsafe URL', '[bad](javascript:alert)'], ['raw HTML', '<iframe src="https://example.com"></iframe>'],
  ['missing asset', '![[missing.png]]'], ['missing heading', '[[Other#Missing]]'],
  ['transclusion', '![[Other]]'], ['unsupported attachment', '[file](script.sh)'],
]) test(`rejects ${name} without modifying previous export`, async t => {
  const f = await fixture(t); await f.write('TCP.md'); await publish(f);
  const before = await fs.readFile(path.join(f.output, 'tcp.md'), 'utf8');
  await f.write('Private.md', 'PRIVATE_SENTINEL', { publish: false }); await f.write('Other.md');
  await fs.writeFile(path.join(f.vault, 'script.sh'), 'secret'); await f.write('TCP.md', body);
  await assert.rejects(publish(f));
  assert.equal(await fs.readFile(path.join(f.output, 'tcp.md'), 'utf8'), before);
});
test('duplicate slugs and ambiguous wikilinks fail', async t => {
  const f = await fixture(t); await f.write('a/TCP.md'); await f.write('b/TCP.md');
  await assert.rejects(publish(f), /Duplicate/);
  await f.write('b/TCP.md', '## Hello', { slug: 'second' }); await f.write('Start.md', '[[TCP]]');
  await assert.rejects(publish(f), /ambiguous/);
});
test('source and output symlinks are rejected', async t => {
  const f = await fixture(t); await fs.writeFile(path.join(f.root, 'secret.png'), 'SECRET');
  await fs.symlink(path.join(f.root, 'secret.png'), path.join(f.vault, 'leak.png'));
  await f.write('TCP.md', '![[leak.png]]'); await assert.rejects(publish(f));
  await f.write('TCP.md'); await fs.symlink(f.vault, f.output); await assert.rejects(publish(f), /symlink/);
});
test('vault inside repo is forbidden', async t => {
  const f = await fixture(t); await assert.rejects(publish({ ...f, vault: f.repo }), /separate/);
});
test('unmanaged directories and existing handwritten slug collisions are protected', async t => {
  const f = await fixture(t); await f.write('TCP.md');
  await fs.writeFile(path.join(f.repo, 'src/content/posts/tcp.md'), serialize(base, 'Existing'));
  await assert.rejects(publish(f), /collides/);
  await fs.unlink(path.join(f.repo, 'src/content/posts/tcp.md')); await fs.mkdir(f.output);
  await fs.writeFile(path.join(f.output, 'custom.md'), 'Keep'); await assert.rejects(publish(f), /unmanaged/);
});
test('validator rejects unapproved content and broken assets', async t => {
  const f = await fixture(t); const file = path.join(f.repo, 'src/content/posts/test.md');
  await fs.writeFile(file, serialize({ ...base, publish: false }, 'Private')); await assert.rejects(validate(f.repo), /Unapproved/);
  await fs.writeFile(file, serialize(base, '![Missing](/media/missing.png)')); await assert.rejects(validate(f.repo));
});
