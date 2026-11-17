import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIndex, filterArticles, topics, relatedArticles } from '../src/lib/library.mjs';
const article = { publish: true, draft: false, slug: 'tcp', title: 'TCP Handshake', description: 'Reliable transport', category: 'Networking', tags: ['packets'], body: '## Connection\n\nUse tcpdump to inspect packets.', date: '2026-11-17' };
const index = buildIndex([article, { ...article, slug: 'linux', title: 'Linux Tools', category: 'linux', tags: ['shell'], body: 'Use systemctl', description: 'Admin commands' }]);
test('search matches title, description, tags and content without case sensitivity', () => {
  for (const query of ['TCP', 'Reliable', 'PACKETS', 'tcpdump']) assert.deepEqual(filterArticles(index, query).map(a => a.slug), ['tcp']);
});
test('multiple search terms intersect and empty query returns all', () => {
  assert.equal(filterArticles(index, 'tcp packets').length, 1);
  assert.equal(filterArticles(index, 'tcp systemctl').length, 0);
  assert.equal(filterArticles(index, '  ').length, 2);
  assert.equal(filterArticles(index, '[.*]').length, 0);
});
test('private, draft and ambiguous approval flags never enter the index', () => {
  for (const flags of [{ publish: false }, { draft: true }, { draft: 'true' }, { publish: undefined }, { publish: 'true' }]) {
    assert.equal(buildIndex([{ ...article, ...flags }]).length, 0);
  }
});
test('topics derive counts from approved metadata including custom and empty topics', () => {
  const collections = topics(buildIndex([article, { ...article, publish: false, category: 'Security' }, { ...article, category: 'Systems' }]));
  assert.equal(collections.find(t => t.name === 'Networking').count, 1);
  assert.equal(collections.find(t => t.name === 'Security').count, 0);
  assert.equal(collections.find(t => t.name === 'Systems').count, 1);
});
test('topic filter combines with search and normalizes categories and AWS aliases', () => {
  assert.equal(filterArticles(index, 'systemctl', 'Linux').length, 1);
  assert.equal(filterArticles(index, 'tcp', 'Linux').length, 0);
  assert.equal(filterArticles(index, '', 'Security').length, 0);
  const aws = buildIndex([{ ...article, category: 'AWS' }]);
  assert.equal(filterArticles(aws, '', 'Cloud & AWS').length, 1);
});
test('TOC preserves duplicate heading IDs, formatted text, and excludes fenced headings', () => {
  const [entry] = buildIndex([{ ...article, body: '## **Hello** world\n\n## Hello world\n\n```bash\n# Not a heading\n```' }]);
  assert.deepEqual(entry.headings.map(h => h.id), ['hello-world', 'hello-world-1']);
  assert.equal(entry.readingMinutes, 1);
});
test('reading time rounds up and related articles rank shared tags over category', () => {
  const entries = buildIndex([article, { ...article, slug: 'category', tags: [] }, { ...article, slug: 'tag', category: 'Linux' }, { ...article, slug: 'unrelated', category: 'Other', tags: [] }]);
  assert.deepEqual(relatedArticles(entries, entries[0]).map(a => a.slug), ['tag', 'category']);
  assert.equal(buildIndex([{ ...article, body: 'word '.repeat(401) }])[0].readingMinutes, 3);
});
