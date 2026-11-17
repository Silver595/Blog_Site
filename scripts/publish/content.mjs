import { parse, stringify } from 'yaml';

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function frontmatter(raw, label) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { data: {}, body: raw };
  let data;
  try { data = parse(match[1]); } catch (error) { throw new Error(`${label}: invalid YAML: ${error.message}`); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${label}: expected a YAML mapping`);
  for (const key of ['publish', 'draft', 'featured']) {
    if (key in data && typeof data[key] !== 'boolean') throw new Error(`${label}: ${key} must be a YAML boolean`);
  }
  return { data, body: raw.slice(match[0].length) };
}
export function metadata(data, filename) {
  for (const key of ['title', 'description', 'category', 'date']) {
    if (typeof data[key] !== 'string' || !data[key].trim()) throw new Error(`${filename}: ${key} must be a nonempty string`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !Number.isFinite(Date.parse(data.date)) || new Date(data.date).toISOString().slice(0, 10) !== data.date) throw new Error(`${filename}: date must be a real YYYY-MM-DD date`);
  if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.some(tag => typeof tag !== 'string' || !tag.trim()))) throw new Error(`${filename}: tags must be a list of strings`);
  const slug = data.slug ?? filename.replace(/\.md$/i, '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (typeof slug !== 'string' || !slugPattern.test(slug)) throw new Error(`${filename}: supply an ASCII slug such as tcp-handshake`);
  // Explicit allowlist: personal frontmatter never gets serialized.
  return { title: data.title, description: data.description, date: data.date, category: data.category, tags: data.tags ?? [], slug, publish: true, draft: false, featured: data.featured === true };
}
export function serialize(data, body) { return `---\n${stringify(data)}---\n\n${body}`; }
