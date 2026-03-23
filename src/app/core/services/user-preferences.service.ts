import { Injectable, signal } from '@angular/core';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type FontStyle = 'sans' | 'serif' | 'mono';
export type ContentWidth = 'narrow' | 'medium' | 'wide';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  fontSize = signal<FontSize>('base');
  fontStyle = signal<FontStyle>('sans');
  contentWidth = signal<ContentWidth>('medium');

  isDark = signal<boolean>(false);

  constructor() {
    // Load from localStorage
    const storedTheme = localStorage.getItem('color-theme');
    if (storedTheme === 'dark') {
      this.isDark.set(true);
      document.documentElement.classList.add('dark');
    }

    const storedFontSize = localStorage.getItem('font-size') as FontSize;
    if (storedFontSize) this.fontSize.set(storedFontSize);

    const storedFontStyle = localStorage.getItem('font-style') as FontStyle;
    if (storedFontStyle) this.fontStyle.set(storedFontStyle);

    const storedWidth = localStorage.getItem('content-width') as ContentWidth;
    if (storedWidth) this.contentWidth.set(storedWidth);
  }

  setFontSize(size: FontSize) {
    this.fontSize.set(size);
    localStorage.setItem('font-size', size);
  }

  setFontStyle(style: FontStyle) {
    this.fontStyle.set(style);
    localStorage.setItem('font-style', style);
  }

  setContentWidth(width: ContentWidth) {
    this.contentWidth.set(width);
    localStorage.setItem('content-width', width);
  }

  toggleTheme() {
    const dark = !this.isDark();
    this.isDark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('color-theme', dark ? 'dark' : 'light');
  }
}
