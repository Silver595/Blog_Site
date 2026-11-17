import test from 'node:test';
import assert from 'node:assert/strict';
import Prism from '../src/vendor/prism.js';
test('syntax highlighting emits tokens and escapes HTML', () => {
  const output = Prism.highlight('const x = "<script>alert(1)</script>";', Prism.languages.javascript, 'javascript');
  assert.match(output, /token keyword/);
  assert.ok(!output.includes('<script>'));
});
