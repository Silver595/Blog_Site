import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIndex, filterArticles } from '../src/lib/library.mjs';
import { metadata } from '../scripts/publish/content.mjs';

test('approved note without category remains searchable', () => {
  const item = metadata({ title:'Note', description:'A description', date:'2026-11-17', publish:true, tags:['ops'] }, 'note.md');
  const index = buildIndex([{ ...item, body: '## Example\n\nA real note' }]);
  assert.equal(index.length,1);
  assert.deepEqual(filterArticles(index,'real').map(i=>i.slug),['note']);
  assert.ok(!Object.hasOwn(item,'category'));
});
