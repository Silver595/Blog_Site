import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIndex, buildLearningPaths } from '../src/lib/library.mjs';
import { metadata } from '../scripts/publish/content.mjs';

const sample = { publish: true, draft: false, title: 'Networking', description: 'Description', date: '2026-11-17', category: 'Networking', tags: [], body: '# Lesson' };
test('learning paths show only approved articles in lesson order', () => {
  const index = buildIndex([
    { ...sample, slug: 'two', learningPath: 'Networking Foundations', lesson: 2 },
    { ...sample, slug: 'private', learningPath: 'Networking Foundations', lesson: 3, publish: false },
    { ...sample, slug: 'one', learningPath: 'Networking Foundations', lesson: 1 },
    { ...sample, slug: 'unassigned' },
  ]);
  const paths = buildLearningPaths(index);
  assert.equal(paths.length, 1);
  assert.equal(paths[0].slug, 'networking-foundations');
  assert.deepEqual(paths[0].lessons.map(a => a.slug), ['one','two']);
  assert.equal(paths[0].totalMinutes, 2);
});
test('learning paths reject duplicate lesson numbers and ignore incomplete direct index data', () => {
  const input = buildIndex([{ ...sample, slug: 'a', learningPath: 'N', lesson: 1 }, { ...sample, slug: 'b', learningPath: 'N', lesson: 1 }]);
  assert.throws(() => buildLearningPaths(input), /Duplicate lesson order/);
  assert.equal(buildLearningPaths(buildIndex([{ ...sample, slug: 'incomplete', learningPath: 'N' }])).length, 0);
});
test('publisher preserves approved learning-path metadata and rejects invalid configuration', () => {
  const data = { title: 'A', description: 'B', category: 'Networking', date: '2026-11-17', tags: [], learningPath: 'Networking Foundations', lesson: 1 };
  assert.equal(metadata(data, 'a.md').learningPath, 'Networking Foundations');
  assert.equal(metadata(data, 'a.md').lesson, 1);
  assert.throws(() => metadata({ ...data, lesson: 0 }, 'a.md'), /positive integer/);
  assert.throws(() => metadata({ ...data, lesson: undefined }, 'a.md'), /provided together/);
});
