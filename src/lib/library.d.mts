import type { Article } from '../content';
export type IndexedArticle = Article & { headings: { id: string; title: string; depth: number }[]; readingMinutes: number; searchText: string };
export const defaultTopics: string[];
export function topicName(category: string): string;
export function buildIndex(articles: Article[]): IndexedArticle[];
export function filterArticles(index: IndexedArticle[], query?: string, topic?: string): IndexedArticle[];
export function topics(index: IndexedArticle[]): { name: string; count: number }[];
export function relatedArticles(index: IndexedArticle[], current: IndexedArticle, limit?: number): IndexedArticle[];
