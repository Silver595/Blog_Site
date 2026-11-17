import { parse } from "yaml";

export type Article = {
  publish: true;
  draft: false;
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  featured: boolean;
  tags: string[];
  learningPath?: string;
  lesson?: number;
  cover?: string;
  body: string;
};

const modules = import.meta.glob("./content/posts/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function decodeArticle(path: string, raw: string): Article | null {
  const matched = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!matched) throw new Error(`Missing YAML frontmatter: ${path}`);
  const metadata = parse(matched[1]) as Record<string, unknown> | null;
  if (!metadata || metadata.publish !== true || metadata.draft === true) throw new Error(`Unapproved note in public content: ${path}`);
  if (!metadata.title || !metadata.date) throw new Error(`Missing title or date: ${path}`);
  const slug = path.split("/").pop()!.replace(/\.md$/i, "");
  return {
    publish: true,
    draft: false,
    slug,
    title: String(metadata.title),
    description: String(metadata.description ?? ""),
    category: String(metadata.category ?? ""),
    date: String(metadata.date),
    featured: metadata.featured === true,
    tags: Array.isArray(metadata.tags) ? metadata.tags.map(String) : [],
    learningPath: typeof metadata.learningPath === 'string' ? metadata.learningPath : undefined,
    lesson: typeof metadata.lesson === 'number' ? metadata.lesson : undefined,
    cover: metadata.cover ? String(metadata.cover) : undefined,
    body: raw.slice(matched[0].length).trim(),
  };
}

export const articles = Object.entries(modules)
  .map(([path, raw]) => decodeArticle(path, raw))
  .filter((article): article is Article => article !== null)
  .sort((a, b) => b.date.localeCompare(a.date));

const uniqueSlugs = new Set(articles.map((article) => article.slug));
if (uniqueSlugs.size !== articles.length) throw new Error("Duplicate article slugs: use unique Markdown file names");

export const featuredArticle = articles.find((article) => article.featured) ?? articles[0];
