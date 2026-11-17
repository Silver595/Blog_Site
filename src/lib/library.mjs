import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import GithubSlugger from 'github-slugger';

const parser = unified().use(remarkParse).use(remarkGfm);
const text = node => node.value ?? node.alt ?? (node.children ?? []).map(text).join('');
const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function buildIndex(articles) {
  return articles.filter(article => article.publish === true && (article.draft === undefined || article.draft === false)).map(article => {
    const tree = parser.parse(article.body); const headings = []; const slugger = new GithubSlugger();
    const words = [];
    function visit(node) {
      if (node.type === 'heading') headings.push({ id: slugger.slug(text(node)), title: text(node), depth: node.depth });
      if (['text', 'code', 'inlineCode'].includes(node.type)) words.push(node.value);
      for (const child of node.children ?? []) visit(child);
    }
    visit(tree);
    const bodyText = words.join(' ');
    return { ...article, headings, readingMinutes: Math.max(1, Math.ceil(bodyText.split(/\s+/).filter(Boolean).length / 200)), searchText: normalize([article.title, article.description, ...article.tags, bodyText].join(' ')) };
  });
}
export function filterArticles(index, query = '') {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return index.filter(article => terms.every(term => article.searchText.includes(term)));
}
export function buildLearningPaths(index) {
  const groups = new Map();
  for (const article of index) {
    if (typeof article.learningPath !== 'string' || !article.learningPath.trim() ||
        !Number.isSafeInteger(article.lesson) || article.lesson < 1) continue;
    const name = article.learningPath.trim();
    const slug = normalize(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) continue;
    if (!groups.has(slug)) groups.set(slug, { slug, title: name, lessons: [] });
    const group = groups.get(slug);
    if (group.title !== name) throw new Error(`Learning path name conflict for ${slug}`);
    group.lessons.push(article);
  }
  return [...groups.values()].map(group => {
    group.lessons.sort((a, b) => a.lesson - b.lesson || a.slug.localeCompare(b.slug));
    const orders = group.lessons.map(item => item.lesson);
    if (orders.length !== new Set(orders).size) throw new Error(`Duplicate lesson order in ${group.slug}`);
    return { ...group, totalMinutes: group.lessons.reduce((sum, item) => sum + item.readingMinutes, 0) };
  }).sort((a, b) => a.title.localeCompare(b.title));
}
export function relatedArticles(index, current, limit = 3) {
  const tags = new Set(current.tags.map(normalize));
  return index.filter(article => article.slug !== current.slug).map(article => ({ article, score: article.tags.filter(tag => tags.has(normalize(tag))).length * 3 })).filter(item => item.score > 0).sort((a, b) => b.score - a.score || b.article.date.localeCompare(a.article.date) || a.article.slug.localeCompare(b.article.slug)).slice(0, limit).map(item => item.article);
}
