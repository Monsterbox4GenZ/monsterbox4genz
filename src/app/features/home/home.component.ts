import {Component, inject, computed, OnInit, signal} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ArticleService } from '../../core/services/article.service';
import { LanguageService } from '../../core/services/language.service';
import { translateGenre } from '../../core/utils/genre-translations';
import {ThemeService} from '../../core/services/theme.service';
import {CommonModule, NgForOf} from '@angular/common';
import {ArticleCardComponent} from '../article-list/article-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ArticleCardComponent],
  template: `
    <!-- Hero Section -->
    <div class="min-h-screen
    bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100
    dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900
    transition-colors duration-500">

      <!-- HERO -->
      <section class="relative text-white">

        <!-- background image -->
        <div
          class="absolute inset-0 bg-cover bg-center"
          style="background-image: url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600');"
        ></div>

        <!-- overlay -->
        <div class="absolute inset-0
            bg-gradient-to-br from-blue-600/80 via-blue-700/80 to-indigo-800/80
            dark:from-blue-900/90 dark:via-purple-900/90 dark:to-indigo-900/90
            transition-colors duration-500"></div>

        <!-- content -->
        <div class="relative max-w-5xl mx-auto px-4 py-25 text-center">

          <!-- stats -->
          <div class="grid grid-cols-3 gap-4 mb-3 mt-12">

            <div class="bg-white/10 backdrop-blur-md rounded-xl py-3">
              <div class="text-xl font-bold">
                {{ articleService.totalArticles() }}
              </div>
              <div class="text-xs text-blue-200">
                {{ langService.t('common.totalArticles') }}
              </div>
            </div>

            <div class="bg-white/10 backdrop-blur-md rounded-xl py-3">
              <div class="text-xl font-bold">
                {{ genreCount() }}
              </div>
              <div class="text-xs text-blue-200">
                {{ langService.t('article.genre') }}
              </div>
            </div>

            <div class="bg-white/10 backdrop-blur-md rounded-xl py-3">
              <div class="text-xl font-bold">2</div>
              <div class="text-xs text-blue-200">
                {{ langService.isVietnamese() ? 'Ngôn ngữ' : 'Languages' }}
              </div>
            </div>

          </div>


        </div>
      </section>
    <!-- Featured Articles -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
          {{ langService.t('common.featuredArticles') }}
        </h2>
        <a
          [routerLink]="['/', lang(), 'articles']"
          class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
        >
          {{ langService.t('common.browseAll') }}
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
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
})
export class HomeComponent implements OnInit {
  articleService = inject(ArticleService);
  langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private title = inject(Title);
  private meta = inject(Meta);

  themeService = inject(ThemeService);
  isDark = signal(false);

  lang = this.langService.currentLang;

  featuredArticles = computed(() => this.articleService.articles().slice(0, 12));

  genreCount = computed(() => this.articleService.getUniqueGenres()().length);

  ngOnInit(): void {
    // Đồng bộ class dark từ localStorage
    this.themeService.initTheme();
    this.isDark.set(this.themeService.isDark());

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

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDark.set(this.themeService.isDark());
  }

  readonly translateGenre = translateGenre;

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(this.lang() === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
