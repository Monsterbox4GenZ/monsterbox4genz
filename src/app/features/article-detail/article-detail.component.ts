import { Component, inject, computed, OnInit, signal, DestroyRef, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NgClass } from '@angular/common';
import { ArticleService } from '../../core/services/article.service';
import { LanguageService } from '../../core/services/language.service';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { FormatContentPipe } from '../../shared/pipes/format-content-pipe';
import { BreadcrumbsComponent, Breadcrumb } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { RelatedArticlesComponent } from './related-articles.component';
import { Article } from '../../core/models/article.model';
import { translateGenre } from '../../core/utils/genre-translations';
import { extractReferences, formatReferencesSection } from '../../core/utils/reference-processor';

// @ts-ignore
@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    MarkdownPipe,
    SafeHtmlPipe,
    FormatContentPipe,
    RelatedArticlesComponent,
  ],
  template: `
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-36 transition-all duration-500"
         [ngClass]="{
           'max-w-3xl':          prefs.contentWidth() === 'narrow',
           'max-w-5xl':          prefs.contentWidth() === 'medium',
           'max-w-screen-2xl':   prefs.contentWidth() === 'wide'
         }">

      @if (loadError()) {
        <!-- Error state -->
        <div class="text-center py-16">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <p class="text-gray-500 text-lg">
            {{ langService.isVietnamese() ? 'Không tìm thấy bài viết.' : 'Article not found.' }}
          </p>
          <a [routerLink]="['/', lang(), 'articles']"
             class="mt-4 inline-block text-blue-600 hover:underline">
            ← {{ langService.t('article.backToList') }}
          </a>
        </div>

      } @else if (article()) {
        <!-- Article Header -->
        <header class="mb-8">
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <a [routerLink]="['/', lang(), 'articles']"
               class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
              ← {{ langService.t('article.backToList') }}
            </a>
          </div>

          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors">
            {{ article()![lang()].title }}
          </h1>

          <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 transition-colors">
            {{ article()![lang()].description }}
          </p>

          <!-- Meta Info -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-800">
            @if (article()!.metadata.creators.length > 0) {
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>{{ article()!.metadata.creators.join(', ') }}</span>
              </div>
            }

            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>{{ langService.t('article.publishedOn') }}: {{ formatDate(article()!.metadata.createdAt) }}</span>
            </div>

            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ readingTime() }} {{ langService.t('article.readingTime') }}</span>
            </div>

            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                         bg-blue-100 text-blue-800">
              {{ translateGenre(article()!.metadata.genres, lang()) }}
            </span>

            @if (article()!.metadata.difficultyLevel !== 'Không có thông tin') {
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    [ngClass]="difficultyClass()">
                {{ article()!.metadata.difficultyLevel }}
              </span>
            }
          </div>
        </header>

        <!-- Font / size preferences wrapper -->
        <div [ngClass]="{
               'text-sm':   prefs.fontSize() === 'sm',
               'text-base': prefs.fontSize() === 'base',
               'text-lg':   prefs.fontSize() === 'lg',
               'text-xl':   prefs.fontSize() === 'xl',
               'font-sans':  prefs.fontStyle() === 'sans',
               'font-serif': prefs.fontStyle() === 'serif',
               'font-mono':  prefs.fontStyle() === 'mono'
             }"
             class="transition-all duration-300">

          <!-- Tags -->
          @if (article()!.metadata.tags.length > 0) {
            <div class="flex flex-wrap gap-2 mb-8">
              @for (tag of article()!.metadata.tags; track tag) {
                <a [routerLink]="['/', lang(), 'search']" [queryParams]="{ q: tag }"
                   class="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                          px-3 py-1 rounded-full hover:bg-blue-100 transition">
                  #{{ tag }}
                </a>
              }
            </div>
          }

          <!-- Article Content -->
          <article class="prose prose-lg dark:prose-invert max-w-none" (click)="onContentClick($event)">
            @if (articleContent()) {
              <div [innerHTML]="articleContent()! | formatContent | markdown | safeHtml"></div>
              @if (referencesHtml()) {
                <div [innerHTML]="referencesHtml()! | safeHtml"></div>
              }
            } @else {
              <div class="text-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-500">{{ langService.t('common.loading') }}</p>
              </div>
            }
          </article>
        </div>

        <!-- Related Articles -->
        <div class="border-gray-100 dark:border-gray-800 pt-3">
          <app-related-articles [articles]="relatedArticles()" />
        </div>

      } @else {
        <!-- Loading State -->
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

  public prefs = inject(UserPreferencesService);

  lang = this.langService.currentLang;

  article = signal<Article | undefined>(undefined);
  loadError = signal(false);

  // Parse body and references from current-language content,
  // falling back to the other language for references if none found.
  private parsedArticle = computed(() => {
    const a = this.article();
    if (!a) return null;
    const lang = this.lang();
    const content = a[lang]?.content;
    if (!content) return null;

    const { body, references } = extractReferences(content);

    let refs = references;
    if (refs.length === 0) {
      const otherLang = lang === 'vi' ? 'en' : 'vi';
      const otherContent = a[otherLang]?.content;
      if (otherContent) {
        refs = extractReferences(otherContent).references;
      }
    }

    const title = lang === 'vi' ? 'Tham khảo' : 'References';
    return {
      body,
      referencesHtml: refs.length > 0 ? formatReferencesSection(refs, title) : null,
    };
  });

  articleContent  = computed(() => this.parsedArticle()?.body ?? null);
  referencesHtml  = computed(() => this.parsedArticle()?.referencesHtml ?? null);

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
        this.metaService.updateTag({ name: 'description',      content: a[lang].description });
        this.metaService.updateTag({ property: 'og:title',       content: a[lang].title });
        this.metaService.updateTag({ property: 'og:description', content: a[lang].description });
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

  /** Scroll to citation/reference anchor and briefly highlight it. */
  onContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a.citation-link, a.ref-back-link') as HTMLAnchorElement | null;
    if (anchor) {
      event.preventDefault();
      const href = anchor.getAttribute('href');
      if (href?.startsWith('#')) {
        const el = document.getElementById(href.substring(1));
        if (el) {
          el.scrollIntoView({ behavior: 'instant' });
          const highlightEl = (el.id.startsWith('cite-')
            ? el.closest('p, li, blockquote, td, h1, h2, h3, h4') ?? el
            : el) as HTMLElement;
          highlightEl.classList.remove('cite-highlight');
          void highlightEl.offsetWidth;       // force reflow
          highlightEl.classList.add('cite-highlight');
        }
      }
    }
  }

  difficultyClass(): string {
    const a = this.article();
    if (!a) return '';
    const level = a.metadata.difficultyLevel;
    if (level.includes('Cơ bản') || level.includes('Basic'))   return 'bg-green-100 text-green-800';
    if (level.includes('Nâng cao') || level.includes('Chuyên sâu') || level.includes('Advanced'))
      return 'bg-red-100   text-red-800';
    return 'bg-amber-100 text-amber-800';
  }
}
