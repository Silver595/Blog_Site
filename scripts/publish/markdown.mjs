import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify);
export function walk(node, fn) {
  fn(node);
  if (node.children) for (const child of node.children) walk(child, fn);
}
export function parseMarkdown(body) { return processor.parse(body); }
export function printMarkdown(tree) { return processor.stringify(tree); }
export function wikiLinks(tree) {
  // Only text AST nodes are transformed: fenced and inline code remain literal.
  function convert(parent) {
    if (!parent.children || ['link', 'image', 'linkReference'].includes(parent.type)) return;
    parent.children = parent.children.flatMap(node => {
      if (node.type !== 'text') { convert(node); return [node]; }
      const result = []; let offset = 0;
      for (const match of node.value.matchAll(/(!?)\[\[([^\]\n]+)\]\]/g)) {
        result.push({ type: 'text', value: node.value.slice(offset, match.index) });
        const [url, alias] = match[2].split('|');
        result.push(match[1] ? { type: 'image', url, alt: alias ?? url, wiki: true } : { type: 'link', url, children: [{ type: 'text', value: alias ?? url }], wiki: true });
        offset = match.index + match[0].length;
      }
      result.push({ type: 'text', value: node.value.slice(offset) });
      return result;
    });
  }
  convert(tree);
}

export function nodeText(node) { return node.value ?? (node.children ?? []).map(nodeText).join(''); }
