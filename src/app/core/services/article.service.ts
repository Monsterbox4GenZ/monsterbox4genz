import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import {
  ArticlesIndex,
  ArticleIndexEntry,
  ArticleContent,
  Article
} from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private readonly BASE_PATH = '/assets/data';

  private indexData = toSignal(
    this.http.get<ArticlesIndex>(`${this.BASE_PATH}/articles-index.json`).pipe(
      catchError(() => of({ meta: { totalArticles: 0 }, articles: [] } as ArticlesIndex)),
      shareReplay(1)
    ),
    { initialValue: { meta: { totalArticles: 0 }, articles: [] } as ArticlesIndex }
  );

  readonly articles = computed(() => {
    const seen = new Set<string>();
    return this.indexData().articles
      .filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      })
      .sort((a, b) =>
        new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
      );
  });
  readonly totalArticles = computed(() => this.indexData().meta.totalArticles);

  private contentCache = new Map<string, Observable<ArticleContent | null>>();
  private loadedArticles = new Map<string, ArticleContent>();

  /**
   * Returns an Observable for the full article (index metadata + content body).
   * Safe to call from anywhere — no injection context required.
   */
  getArticle$(slug: string): Observable<Article | undefined> {
    const cached = this.loadedArticles.get(slug);
    if (cached) {
      return of(this.mergeWithIndex(slug, cached));
    }

    return this.loadArticleContent(slug).pipe(
      map(content => {
        if (content) {
          this.loadedArticles.set(slug, content);
          return this.mergeWithIndex(slug, content);
        }
        return this.getIndexEntry(slug);
      })
    );
  }

  getArticlesByGenre(genre: string) {
    return computed(() =>
      this.articles().filter(a => a.metadata.genres.includes(genre))
    );
  }

  getRelatedArticles(articleId: string, limit = 5) {
    return computed(() => {
      const article = this.articles().find(a => a.id === articleId);
      if (!article) return [];

      const articleTags = new Set(article.metadata.tags);
      const genre = article.metadata.genres;

      return this.articles()
        .filter(a => a.id !== articleId)
        .map(a => ({
          article: a,
          score: this.calculateSimilarity(a, articleTags, genre)
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ article }) => article);
    });
  }

  getUniqueGenres() {
    return computed(() => {
      const genres = new Set<string>();
      this.articles().forEach(a => {
        if (a.metadata.genres) {
          a.metadata.genres.split(',').forEach(g => genres.add(g.trim()));
        }
      });
      return Array.from(genres).sort();
    });
  }

  getUniqueDifficulties() {
    return computed(() => {
      const difficulties = new Set<string>();
      this.articles().forEach(a => {
        const d = a.metadata.difficultyLevel?.trim();
        if (d && !d.toLowerCase().includes('không có thông tin')) {
          difficulties.add(d);
        }
      });
      return Array.from(difficulties).sort();
    });
  }

  getArticlesByDifficulty(difficulty: string) {
    return this.articles().filter(a =>
      a.metadata.difficultyLevel?.trim() === difficulty
    );
  }

  getUniqueCreators() {
    return computed(() => {
      const creators = new Set<string>();
      this.articles().forEach(a => {
        a.metadata.creators?.forEach(c => creators.add(c.trim()));
      });
      return Array.from(creators).sort();
    });
  }

  getArticlesByCreator(creator: string) {
    return this.articles().filter(a =>
      a.metadata.creators?.some(c => c.trim() === creator)
    );
  }

  getGenresForCreator(creator: string): string[] {
    const genres = new Set<string>();
    this.getArticlesByCreator(creator).forEach(a => {
      if (a.metadata.genres) {
        a.metadata.genres.split(',').forEach(g => genres.add(g.trim()));
      }
    });
    return Array.from(genres).sort();
  }

  getArticlesByCreatorAndGenre(creator: string, genre: string) {
    return this.getArticlesByCreator(creator).filter(a =>
      a.metadata.genres?.includes(genre)
    );
  }

  preloadArticle(slug: string): void {
    if (!this.loadedArticles.has(slug) && !this.contentCache.has(slug)) {
      this.loadArticleContent(slug).subscribe();
    }
  }

  getIndexEntry(slug: string): Article | undefined {
    return this.articles().find(a => a.id === slug) as Article | undefined;
  }

  private loadArticleContent(slug: string): Observable<ArticleContent | null> {
    if (!this.contentCache.has(slug)) {
      const content$ = this.http
        .get<ArticleContent>(`${this.BASE_PATH}/articles/${slug}.json`)
        .pipe(
          catchError(() => of(null)),
          shareReplay(1)
        );
      this.contentCache.set(slug, content$);
    }
    return this.contentCache.get(slug)!;
  }

  private mergeWithIndex(slug: string, content: ArticleContent): Article | undefined {
    const indexEntry = this.getIndexEntry(slug);
    if (!indexEntry) return undefined;

    return {
      ...indexEntry,
      vi: { ...indexEntry.vi, content: content.vi.content },
      en: { ...indexEntry.en, content: content.en.content }
    };
  }

  private calculateSimilarity(article: ArticleIndexEntry, tags: Set<string>, genre: string): number {
    let score = 0;
    if (article.metadata.genres === genre) score += 3;
    article.metadata.tags.forEach(tag => { if (tags.has(tag)) score += 1; });
    return score;
  }
}
