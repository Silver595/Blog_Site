import test from 'node:test';
import assert from 'node:assert/strict';
import { frontmatter, metadata, serialize } from '../scripts/publish/content.mjs';
const valid = { title: 'TCP', description: 'TCP explained', date: '2026-11-17', category: 'Networking', publish: true };
test('YAML booleans are explicit and dates stay strings', () => {
  assert.equal(frontmatter(serialize(valid, 'Body'), 'test').data.date, '2026-11-17');
  for (const key of ['publish', 'draft', 'featured']) assert.throws(() => frontmatter(`---\n${key}: "true"\n---\n`, 'test'), /boolean/);
});
test('metadata rejects invalid calendar dates and malformed fields', () => {
  for (const change of [{ date: '2026-02-30' }, { date: 'yesterday' }, { title: 42 }, { tags: 'tcp' }, { slug: '../escape' }]) assert.throws(() => metadata({ ...valid, ...change }, 'TCP.md'));
});
test('slug stays tied to filename; personal metadata is not exported', () => {
  const result = metadata({ ...valid, title: 'New title', private_token: 'SECRET' }, 'TCP Guide.md');
  assert.equal(result.slug, 'tcp-guide');
  assert.ok(!serialize(result, 'Body').includes('SECRET'));
});
test('malformed YAML and duplicate keys fail closed', () => {
  for (const yaml of ['publish: [', 'publish: true\npublish: false', '- item']) assert.throws(() => frontmatter(`---\n${yaml}\n---\n`, 'test'));
});
