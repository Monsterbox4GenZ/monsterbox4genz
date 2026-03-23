import { Component, inject, computed, OnInit, signal, DestroyRef, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ArticleService } from '../../core/services/article.service';
import { LanguageService } from '../../core/services/language.service';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { BreadcrumbsComponent, Breadcrumb } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { RelatedArticlesComponent } from './related-articles.component';
import { Article } from '../../core/models/article.model';
import { translateGenre } from '../../core/utils/genre-translations';
import { FormatContentPipe } from '../../shared/pipes/format-content-pipe';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [RouterLink, MarkdownPipe, SafeHtmlPipe, BreadcrumbsComponent, RelatedArticlesComponent, FormatContentPipe, NgClass],
  template: `

    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-36 transition-all duration-500"
         [ngClass]="{
           'max-w-3xl': prefs.contentWidth() === 'narrow',
           'max-w-5xl': prefs.contentWidth() === 'medium',
           'max-w-screen-2xl': prefs.contentWidth() === 'wide'
         }">

      @if (loadError()) {
        <div class="text-center py-16">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <p class="text-gray-500 text-lg">{{ langService.isVietnamese() ? 'Không tìm thấy bài viết.' : 'Article not found.' }}</p>
          <a [routerLink]="['/', lang(), 'articles']" class="mt-4 inline-block text-blue-600 hover:underline">
            ← {{ langService.t('article.backToList') }}
          </a>
        </div>
      } @else if (article()) {
        <header class="mb-8">
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <a [routerLink]="['/', lang(), 'articles']" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              ← {{ langService.t('article.backToList') }}
            </a>
          </div>

          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors">
            {{ article()![lang()].title }}
          </h1>

          <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 transition-colors">
            {{ article()![lang()].description }}
          </p>

          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-800">
            <span>{{ article()!.metadata.creators.join(', ') }}</span>
            <span>{{ formatDate(article()!.metadata.createdAt) }}</span>
            <span>{{ readingTime() }} {{ langService.t('article.readingTime') }}</span>
            <span class="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {{ translateGenre(article()!.metadata.genres, lang()) }}
            </span>
          </div>
        </header>

        <div [ngClass]="{
          'text-sm': prefs.fontSize() === 'sm',
          'text-base': prefs.fontSize() === 'base',
          'text-lg': prefs.fontSize() === 'lg',
          'text-xl': prefs.fontSize() === 'xl',
          'font-sans': prefs.fontStyle() === 'sans',
          'font-serif': prefs.fontStyle() === 'serif',
          'font-mono': prefs.fontStyle() === 'mono'
        }" class="transition-all duration-300">

          @if (article()!.metadata.tags.length > 0) {
            <div class="flex flex-wrap gap-2 mb-8">
              @for (tag of article()!.metadata.tags; track tag) {
                <a [routerLink]="['/', lang(), 'search']" [queryParams]="{ q: tag }"
                   class="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-blue-100 transition">
                  #{{ tag }}
                </a>
              }
            </div>
          }

          <article class="prose prose-lg dark:prose-invert max-w-none">
            @if (articleContent()) {
              <div [innerHTML]="articleContent()! | formatContent | markdown | safeHtml"></div>
            } @else {
              <div class="text-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            }
          </article>
        </div>

        <div class="mt-16 border-t border-gray-100 dark:border-gray-800 pt-10">
          <app-related-articles [articles]="relatedArticles()" />
        </div>
      } @else {
        <div class="text-center py-16">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500 text-lg">{{ langService.t('common.loading') }}</p>
        </div>
      }
    </div>
  `
})
export class ArticleDetailComponent implements OnInit {
  private articleService = inject(ArticleService);
  langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private destroyRef = inject(DestroyRef);

  // Inject service để dùng cho template
  public prefs = inject(UserPreferencesService);

  lang = this.langService.currentLang;
  article = signal<Article | undefined>(undefined);
  loadError = signal(false);

  articleContent = computed(() => {
    const a = this.article();
    return a ? a[this.lang()]?.content ?? null : null;
  });

  readingTime = computed(() => {
    const a = this.article();
    return a ? Math.max(1, Math.ceil((a.metadata.length || 0) / 1500)) : 0;
  });

  relatedArticles = computed(() => {
    const a = this.article();
    return a ? this.articleService.getRelatedArticles(a.id, 6)() : [];
  });

  breadcrumbs = computed<Breadcrumb[]>(() => {
    const a = this.article();
    return [
      { label: this.langService.t('nav.articles'), route: ['/', this.lang(), 'articles'] },
      { label: a ? a[this.lang()].title : '...' }
    ];
  });

  constructor() {
    effect(() => {
      const a = this.article();
      if (a) {
        const lang = this.lang();
        this.titleService.setTitle(`${a[lang].title} | Monster Box`);
        this.metaService.updateTag({ name: 'description', content: a[lang].description });
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const lang = params.get('lang');
        if (lang) this.langService.setLanguageFromRoute(lang);

        const slug = params.get('slug');
        if (slug) {
          this.article.set(undefined);
          this.loadError.set(false);
          window.scrollTo({ top: 0, behavior: 'instant' });

          this.articleService.getArticle$(slug)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (art) => art ? this.article.set(art) : this.loadError.set(true),
              error: () => this.loadError.set(true)
            });
        }
      });
  }

  readonly translateGenre = translateGenre;

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(this.lang() === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  difficultyClass(): string {
    const a = this.article();
    if (!a) return '';
    const level = a.metadata.difficultyLevel;
    if (level.includes('Cơ bản') || level.includes('Basic')) return 'bg-green-100 text-green-800';
    if (level.includes('Nâng cao') || level.includes('Advanced')) return 'bg-red-100 text-red-800';
    return 'bg-amber-100 text-amber-800';
  }
}
