import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';
import { LanguageToggleComponent } from './language-toggle.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import {
  ContentWidth,
  FontSize,
  FontStyle,
  UserPreferencesService,
} from '../../../core/services/user-preferences.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LanguageToggleComponent, FormsModule, CommonModule],
  template: `
    <nav
      id="main-nav"
      class="fixed top-0 left-0 right-0 z-50 w-full max-w-7xl mx-auto mt-2 md:mt-4 px-4 transition-all duration-300"
    >
      <ng-template #settingsMenu>
        <div
          *ngIf="settingOpen()"
          class="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div class="space-y-6">
            <div>
              <label
                class="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3"
                >Cỡ chữ</label
              >
              <div class="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                @for (size of fontSizes; track size) {
                  <button
                    (click)="prefs.setFontSize(size)"
                    class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
                    [ngClass]="
                      prefs.fontSize() === size
                        ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                        : 'text-gray-500'
                    "
                  >
                    {{ size === 'base' ? 'Mặc định' : (size | uppercase) }}
                  </button>
                }
              </div>
            </div>

            <div>
              <label
                class="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3"
                >Kiểu chữ</label
              >
              <div class="grid grid-cols-3 gap-2">
                @for (style of fontStyles; track style.id) {
                  <button
                    (click)="prefs.setFontStyle(style.id)"
                    class="flex flex-col items-center py-3 border-2 rounded-2xl transition-all"
                    [ngClass]="
                      prefs.fontStyle() === style.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400'
                    "
                  >
                    <span [class]="'font-' + style.id" class="text-xl mb-1">Aa</span>
                    <span class="text-[10px] font-bold uppercase">{{ style.label }}</span>
                  </button>
                }
              </div>
            </div>

            <div>
              <label
                class="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3"
                >Độ rộng</label
              >
              <div class="flex gap-2">
                @for (w of contentWidths; track w.id) {
                  <button
                    (click)="prefs.setContentWidth(w.id)"
                    class="flex-1 flex flex-col items-center py-3 rounded-2xl border-2 transition-all"
                    [ngClass]="
                      prefs.contentWidth() === w.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                        : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400'
                    "
                  >
                    <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        [attr.d]="w.icon"
                      ></path>
                    </svg>
                    <span class="text-[10px] font-bold uppercase">{{ w.label }}</span>
                  </button>
                }
              </div>
            </div>

            <button
              (click)="resetToDefault()"
              class="w-full py-2 text-[11px] font-bold text-gray-400 hover:text-red-500 border-t border-gray-100 dark:border-gray-800 pt-4 uppercase tracking-widest transition-colors"
            >
              Khôi phục mặc định
            </button>
          </div>
        </div>
      </ng-template>

      <div
        id="nav-container"
        class="bg-white dark:bg-gray-900 w-full max-w-7xl mx-auto rounded-2xl md:rounded-full px-2 py-1 md:px-4 md:py-2 flex justify-between items-center shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-500"
      >
        <div class="flex justify-between items-center w-full md:w-auto">
          <a [routerLink]="['/', lang()]" class="text-xl md:text-2xl font-bold flex-shrink-0">
            <span
              class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Monster Box
            </span>
          </a>

          <div class="flex md:hidden items-center gap-1.5 sm:gap-2">
            <app-language-toggle />
            <button
              (click)="prefs.toggleTheme()"
              class="p-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transition-all"
            >
              @if (prefs.isDark()) {
                <svg class="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm4 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              } @else {
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8 8 0 1010.586 10.586z" />
                </svg>
              }
            </button>
            <div class="relative">
              <button
                (click)="toggleSetting()"
                class="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </button>
              <ng-container *ngTemplateOutlet="settingsMenu"></ng-container>
            </div>
            <button
              (click)="toggleMobileMenu()"
              class="p-1.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div
          id="nav-links-desktop"
          class="hidden md:flex gap-8 text-[15px] font-medium text-gray-700 dark:text-gray-200 transition-all duration-500 max-w-[500px] overflow-hidden whitespace-nowrap opacity-100"
        >
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path ? ['/', lang(), item.path] : ['/', lang()]"
              class="relative group transition-all duration-300"
              [class.text-transparent]="isActive(item.path)"
              [class.bg-gradient-to-r]="isActive(item.path)"
              [class.from-blue-600]="isActive(item.path)"
              [class.to-purple-600]="isActive(item.path)"
              [class.bg-clip-text]="isActive(item.path)"
            >
              <span
                class="group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text"
              >
                {{ langService.t(item.label) }}
              </span>
              <span
                class="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                [class.w-full]="isActive(item.path)"
                [class.w-0]="!isActive(item.path)"
                [class.group-hover:w-full]="!isActive(item.path)"
              ></span>
            </a>
          }
        </div>

        <div class="hidden md:flex items-center gap-2 sm:gap-3">
          <app-language-toggle />

          <button
            (click)="prefs.toggleTheme()"
            class="p-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transition-all"
          >
            @if (prefs.isDark()) {
              <svg class="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm4 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            } @else {
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8 8 0 1010.586 10.586z" />
              </svg>
            }
          </button>

          <div class="relative">
            <button
              (click)="toggleSetting()"
              class="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </button>
            <ng-container *ngTemplateOutlet="settingsMenu"></ng-container>
          </div>
        </div>
      </div>

      @if (mobileMenuOpen()) {
        <div
          class="mt-3 md:hidden bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 space-y-2 animate-in fade-in slide-in-from-top-2"
        >
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path ? ['/', lang(), item.path] : ['/', lang()]"
              (click)="closeMobileMenu()"
              class="block px-4 py-2 text-sm font-medium rounded-lg"
              [ngClass]="
                isActive(item.path)
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              "
            >
              {{ langService.t(item.label) }}
            </a>
          }
        </div>
      }
    </nav>
  `,
  styles: [
    `
      .glass {
        background: rgba(255, 255, 255, 0.75) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
    `,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  langService = inject(LanguageService);
  prefs = inject(UserPreferencesService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  settingOpen = signal(false);
  lang = this.langService.currentLang;
  currentUrl = signal(this.router.url);

  navItems = [
    { path: '', label: 'nav.home' },
    { path: 'articles', label: 'nav.articles' },
    { path: 'search', label: 'nav.search' },
  ];

  fontSizes: FontSize[] = ['sm', 'base', 'lg', 'xl'];
  fontStyles: { id: FontStyle; label: string }[] = [
    { id: 'sans', label: 'Sans' },
    { id: 'serif', label: 'Serif' },
    { id: 'mono', label: 'Mono' },
  ];

  contentWidths: { id: ContentWidth; label: string; icon: string }[] = [
    { id: 'narrow', label: 'Hẹp', icon: 'M4 6h16M8 12h8M4 18h16' },
    { id: 'medium', label: 'Vừa', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'wide', label: 'Rộng', icon: 'M2 6h20M2 12h20M2 18h20' },
  ];

  private routerSub = this.router.events
    .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
    .subscribe((e) => this.currentUrl.set(e.urlAfterRedirects));

  isActive(path: string): boolean {
    const url = this.currentUrl();
    const lang = this.lang();
    if (path === '') {
      return url === `/${lang}` || url === `/${lang}/`;
    }
    return url.startsWith(`/${lang}/${path}`);
  }

  ngOnInit() {
    window.addEventListener('scroll', this.handleScroll);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
    this.routerSub.unsubscribe();
  }

  handleScroll = () => {
    const nav = document.getElementById('main-nav');
    const container = document.getElementById('nav-container');
    const desktopLinks = document.getElementById('nav-links-desktop');

    if (!nav || !container) return;

    if (window.scrollY > 50) {
      if (window.innerWidth >= 768) {
        container.classList.add('glass', 'max-w-[800px]', 'md:py-2');
        container.classList.remove('md:py-3', 'max-w-7xl');
        if (desktopLinks) {
          desktopLinks.classList.add('max-w-0', 'opacity-0');
          desktopLinks.classList.remove('max-w-[500px]', 'opacity-100', 'gap-8');
        }
      } else {
        container.classList.add('glass');
      }
    } else {
      if (window.innerWidth >= 768) {
        container.classList.remove('glass', 'max-w-[800px]', 'md:py-2');
        container.classList.add('md:py-3', 'max-w-7xl');
        if (desktopLinks) {
          desktopLinks.classList.remove('max-w-0', 'opacity-0');
          desktopLinks.classList.add('max-w-[500px]', 'opacity-100', 'gap-8');
        }
      } else {
        container.classList.remove('glass');
      }
    }
  };

  toggleSetting() {
    this.settingOpen.update((v) => !v);
  }

  resetToDefault() {
    this.prefs.setFontSize('base');
    this.prefs.setFontStyle('sans');
    this.prefs.setContentWidth('medium');
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
