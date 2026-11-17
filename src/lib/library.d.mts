import type { Article } from '../content';
export type IndexedArticle = Article & { headings: { id: string; title: string; depth: number }[]; readingMinutes: number; searchText: string };
export function buildIndex(articles: Article[]): IndexedArticle[];
export function filterArticles(index: IndexedArticle[], query?: string): IndexedArticle[];
export function relatedArticles(index: IndexedArticle[], current: IndexedArticle, limit?: number): IndexedArticle[];
export type LearningPath = { slug: string; title: string; lessons: IndexedArticle[]; totalMinutes: number };
export function buildLearningPaths(index: IndexedArticle[]): LearningPath[];
