import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ArticleService } from '../../core/services/article.service';
import { LanguageService } from '../../core/services/language.service';
import { translateGenre, translateDifficulty } from '../../core/utils/genre-translations';
import { CommonModule } from '@angular/common';
import { ArticleCardComponent } from '../article-list/article-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ArticleCardComponent],
  template: `
    <div class="min-h-screen
      bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100
      dark:from-gray-950 dark:via-gray-900 dark:to-purple-950
      transition-colors duration-500"
      (click)="closeRandomMenu()">

      <!-- HERO -->
      <section class="relative text-white  h-[500px] md:h-[400px] flex items-center">
        <div
          class="absolute inset-0 bg-cover bg-center"
          style="background-image: url('../../../assets/images/banner.jpg');"
        ></div>

        <div class="absolute inset-0
          bg-gradient-to-br to-indigo-800/80
          dark:from-gray-950/90 dark:via-purple-950/85 dark:to-gray-950/90
          transition-colors duration-500"></div>

        <!-- Stats on the left edge (desktop) / right edge (mobile) -->
        <div class="absolute right-4 top-22 xl:top-1/2 xl:-translate-y-[40%] xl:right-auto xl:left-30 flex flex-col gap-2 xl:gap-4 z-10">
          <div class="bg-white/10 backdrop-blur-md rounded-lg xl:rounded-xl py-2 px-3 xl:py-3 xl:px-5 border border-white/20 shadow-lg text-right xl:text-left hover:bg-white/20 transition-colors">
            <div class="text-lg xl:text-2xl font-bold">
              {{ articleService.totalArticles() }}
            </div>

            <div class="text-[9px] xl:text-[11px] font-medium text-blue-200 uppercase tracking-wider">
              {{ langService.t('common.totalArticles') }}
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-lg xl:rounded-xl py-2 px-3 xl:py-3 xl:px-5 border border-white/20 shadow-lg text-right xl:text-left hover:bg-white/20 transition-colors">
            <div class="text-lg xl:text-2xl font-bold">
              {{ genreCount() }}
            </div>

            <div class="text-[9px] xl:text-[11px] font-medium text-blue-200 uppercase tracking-wider">
              {{ langService.t('article.genre') }}
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-lg xl:rounded-xl py-2 px-3 xl:py-3 xl:px-5 border border-white/20 shadow-lg text-right xl:text-left hover:bg-white/20 transition-colors">
            <div class="text-lg xl:text-2xl font-bold">2</div>
            <div class="text-[9px] xl:text-[11px] font-medium text-blue-200 uppercase tracking-wider">
              {{ langService.t('home.languages') }}
            </div>
          </div>

        </div>

        <div class="relative max-w-5xl mx-auto px-4 py-24 md:py-40 text-center w-full z-10">
          <!-- Two Main Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-80 md:mt-60">
            <button
              (click)="toggleRandomMenu(); $event.stopPropagation()"
              class="flex items-center gap-2 px-8 py-3.5 rounded-xl
                bg-white/15 backdrop-blur-md border border-white/25
                hover:bg-white/25 transition-all duration-200
                text-white font-semibold text-lg shadow-lg
                hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
              </svg>
              {{ langService.t('home.randomArticle') }}
              <svg class="w-4 h-4 transition-transform duration-200"
                [class.rotate-180]="showRandomMenu()"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <a
              [routerLink]="['/', lang(), 'articles']"
              class="flex items-center gap-2 px-8 py-3.5 rounded-xl
                bg-white/15 backdrop-blur-md border border-white/25
                hover:bg-white/25 transition-all duration-200
                text-white font-semibold text-lg shadow-lg
                hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              {{ langService.t('home.browseArticles') }}
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

        </div>
      </section>

      <!-- Random Panel (horizontal overlay) -->
      @if (showRandomMenu()) {
        <div class="relative z-40 -mt-6 px-4" (click)="$event.stopPropagation()">
          <div class="max-w-5xl mx-auto
            bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
            rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50
            overflow-hidden">
            <div class="grid grid-cols-1 md:grid-cols-4">

              <!-- Completely Random -->
              <div class="flex flex-col items-center gap-3 px-5 py-6
                border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700/50">
                <span class="flex items-center justify-center w-10 h-10 rounded-xl
                  bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                  </svg>
                </span>
                <div class="font-medium text-sm text-gray-800 dark:text-gray-100">
                  {{ langService.t('home.completelyRandom') }}
                </div>
                <div class="flex-1"></div>
                <button
                  (click)="goCompletelyRandom()"
                  class="w-full px-4 py-2 rounded-lg text-sm font-medium
                    bg-blue-600 text-white hover:bg-blue-700
                    transition-colors">
                  {{ langService.t('home.go') }}
                </button>
              </div>

              <!-- Random by Genre -->
              <div class="flex flex-col items-center gap-3 px-5 py-6
                border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700/50">
                <span class="flex items-center justify-center w-10 h-10 rounded-xl
                  bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                </span>
                <div class="font-medium text-sm text-gray-800 dark:text-gray-100">
                  {{ langService.t('home.randomByGenre') }}
                </div>
                <select
                  class="w-full px-3 py-2 rounded-lg text-sm
                    bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                    text-gray-700 dark:text-gray-200
                    focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  [value]="selectedGenre()"
                  (change)="selectedGenre.set(asInputValue($event))">
                  <option value="">{{ langService.t('home.selectGenre') }}</option>
                  @for (genre of genres(); track genre) {
                    <option [value]="genre">{{ translateGenre(genre, lang()) }}</option>
                  }
                </select>
                <div class="flex-1"></div>
                <button
                  (click)="goRandomByGenre()"
                  [disabled]="!selectedGenre()"
                  class="w-full px-4 py-2 rounded-lg text-sm font-medium
                    bg-purple-600 text-white hover:bg-purple-700
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors">
                  {{ langService.t('home.go') }}
                </button>
              </div>

              <!-- Random by Difficulty -->
              <div class="flex flex-col items-center gap-3 px-5 py-6
                border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700/50">
                <span class="flex items-center justify-center w-10 h-10 rounded-xl
                  bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </span>
                <div class="font-medium text-sm text-gray-800 dark:text-gray-100">
                  {{ langService.t('home.randomByDifficulty') }}
                </div>
                <select
                  class="w-full px-3 py-2 rounded-lg text-sm
                    bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                    text-gray-700 dark:text-gray-200
                    focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  [value]="selectedDifficulty()"
                  (change)="selectedDifficulty.set(asInputValue($event))">
                  <option value="">{{ langService.t('home.selectDifficulty') }}</option>
                  @for (diff of difficulties(); track diff) {
                    <option [value]="diff">{{ translateDifficulty(diff, lang()) }}</option>
                  }
                </select>
                <div class="flex-1"></div>
                <button
                  (click)="goRandomByDifficulty()"
                  [disabled]="!selectedDifficulty()"
                  class="w-full px-4 py-2 rounded-lg text-sm font-medium
                    bg-amber-600 text-white hover:bg-amber-700
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors">
                  {{ langService.t('home.go') }}
                </button>
              </div>

              <!-- Random by Author -->
              <div class="flex flex-col items-center gap-3 px-5 py-6">
                <span class="flex items-center justify-center w-10 h-10 rounded-xl
                  bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </span>
                <div class="font-medium text-sm text-gray-800 dark:text-gray-100">
                  {{ langService.t('home.randomByAuthor') }}
                </div>
                <select
                  class="w-full px-3 py-2 rounded-lg text-sm
                    bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                    text-gray-700 dark:text-gray-200
                    focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  [value]="selectedCreator()"
                  (change)="onCreatorChange(asInputValue($event))">
                  <option value="">{{ langService.t('home.selectAuthor') }}</option>
                  @for (creator of creators(); track creator) {
                    <option [value]="creator">{{ displayCreator(creator) }}</option>
                  }
                </select>
                @if (selectedCreator() && creatorGenres().length > 0) {
                  <select
                    class="w-full px-3 py-2 rounded-lg text-sm
                      bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                      text-gray-700 dark:text-gray-200
                      focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    [value]="selectedCreatorGenre()"
                    (change)="selectedCreatorGenre.set(asInputValue($event))">
                    <option value="">{{ langService.t('home.selectGenre') }}</option>
                    @for (genre of creatorGenres(); track genre) {
                      <option [value]="genre">{{ translateGenre(genre, lang()) }}</option>
                    }
                  </select>
                }
                <div class="flex-1"></div>
                <button
                  (click)="goRandomByAuthor()"
                  [disabled]="!selectedCreator()"
                  class="w-full px-4 py-2 rounded-lg text-sm font-medium
                    bg-emerald-600 text-white hover:bg-emerald-700
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors">
                  {{ langService.t('home.go') }}
                </button>
              </div>

            </div>
          </div>
        </div>
      }

      <!-- Featured Articles -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ langService.t('common.featuredArticles') }}
          </h2>
          <a
            [routerLink]="['/', lang(), 'articles']"
            class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
          >
            {{ langService.t('common.browseAll') }}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (article of featuredArticles(); track article.id) {
            <app-article-card [article]="article" />
          }
        </div>
      </section>

    </div>
  `,
  styles: [],
})
export class HomeComponent implements OnInit {
  articleService = inject(ArticleService);
  langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);

  lang = this.langService.currentLang;

  featuredArticles = computed(() => this.articleService.articles().slice(0, 12));
  genreCount = computed(() => this.articleService.getUniqueGenres()().length);

  genres = computed(() => this.articleService.getUniqueGenres()());
  creators = computed(() => this.articleService.getUniqueCreators()());
  difficulties = computed(() => this.articleService.getUniqueDifficulties()());

  showRandomMenu = signal(false);
  selectedGenre = signal('');
  selectedDifficulty = signal('');
  selectedCreator = signal('');
  selectedCreatorGenre = signal('');

  creatorGenres = computed(() => {
    const creator = this.selectedCreator();
    if (!creator) return [];
    return this.articleService.getGenresForCreator(creator);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const lang = params.get('lang');
      if (lang) this.langService.setLanguageFromRoute(lang);
    });

    this.title.setTitle('Monster Box Articles');
    this.meta.updateTag({
      name: 'description',
      content: 'Bilingual Vietnamese-English article platform',
    });
  }

  readonly translateGenre = translateGenre;
  readonly translateDifficulty = translateDifficulty;

  displayCreator(creator: string): string {
    if (this.lang() === 'en' && creator === 'Không có thông tin') {
      return 'No information';
    }
    return creator;
  }

  toggleRandomMenu(): void {
    this.showRandomMenu.update(v => !v);
  }

  closeRandomMenu(): void {
    this.showRandomMenu.set(false);
  }

  asInputValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  onCreatorChange(creator: string): void {
    this.selectedCreator.set(creator);
    this.selectedCreatorGenre.set('');
  }

  goCompletelyRandom(): void {
    const articles = this.articleService.articles();
    if (articles.length === 0) return;
    const random = articles[Math.floor(Math.random() * articles.length)];
    this.showRandomMenu.set(false);
    this.router.navigate(['/', this.lang(), 'article', random.id]);
  }

  goRandomByGenre(): void {
    const genre = this.selectedGenre();
    if (!genre) return;
    const articles = this.articleService.getArticlesByGenre(genre)();
    if (articles.length === 0) return;
    const random = articles[Math.floor(Math.random() * articles.length)];
    this.showRandomMenu.set(false);
    this.router.navigate(['/', this.lang(), 'article', random.id]);
  }

  goRandomByDifficulty(): void {
    const difficulty = this.selectedDifficulty();
    if (!difficulty) return;
    const articles = this.articleService.getArticlesByDifficulty(difficulty);
    if (articles.length === 0) return;
    const random = articles[Math.floor(Math.random() * articles.length)];
    this.showRandomMenu.set(false);
    this.router.navigate(['/', this.lang(), 'article', random.id]);
  }

  goRandomByAuthor(): void {
    const creator = this.selectedCreator();
    if (!creator) return;
    const genre = this.selectedCreatorGenre();

    let articles = genre
      ? this.articleService.getArticlesByCreatorAndGenre(creator, genre)
      : this.articleService.getArticlesByCreator(creator);

    if (articles.length === 0) return;
    const random = articles[Math.floor(Math.random() * articles.length)];
    this.showRandomMenu.set(false);
    this.router.navigate(['/', this.lang(), 'article', random.id]);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(this.lang() === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
