import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  template: `
    <button
      (click)="langService.toggleLanguage()"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] font-medium

         bg-gradient-to-r from-blue-600 to-purple-600 text-white
         shadow-md shadow-blue-500/20

         hover:from-blue-500 hover:to-purple-500
         hover:shadow-lg hover:shadow-purple-500/30
         hover:scale-[1.03]

         active:scale-95
         transition-all duration-200 cursor-pointer"
    >
      <span class="text-xs">{{ langService.isVietnamese() ? '🇻🇳' : '🇬🇧' }}</span>
      <span>{{ langService.isVietnamese() ? 'VI' : 'EN' }}</span>
    </button>
  `,
})
export class LanguageToggleComponent {
  langService = inject(LanguageService);
}
