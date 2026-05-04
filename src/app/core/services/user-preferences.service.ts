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
    // Dark mode — apply class to <html> immediately on load
    const savedTheme = localStorage.getItem('color-theme');
    const dark = savedTheme === 'dark';
    this.isDark.set(dark);
    document.documentElement.classList.toggle('dark', dark);

    // Other preferences
    const storedFontSize = localStorage.getItem('font-size') as FontSize;
    if (storedFontSize) this.fontSize.set(storedFontSize);

    const storedFontStyle = localStorage.getItem('font-style') as FontStyle;
    if (storedFontStyle) this.fontStyle.set(storedFontStyle);

    const storedWidth = localStorage.getItem('content-width') as ContentWidth;
    if (storedWidth) this.contentWidth.set(storedWidth);
  }

  toggleTheme() {
    const dark = !this.isDark();
    this.isDark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('color-theme', dark ? 'dark' : 'light');
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
}
