import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatContent',
  standalone: true
})
export class FormatContentPipe implements PipeTransform {

  transform(content: string | null): string {
    if (!content) return '';

    let result = content;

    // 1. Normalize line breaks
    result = result.replace(/\r\n/g, '\n');

    // 2. Convert numbered headings
    // "1. Title" → "## 1. Title"
    result = result.replace(
      /(^|\n)(\d+)\.\s(.+)/g,
      (_, start, num, title) => {
        return `${start}### ${num}. ${title}`;
      }
    );

    // ================================
    // 3. Convert short title lines → heading
    // Ví dụ:
    // "Về ngôn ngữ."
    // ================================
    // result = result.replace(
    //   /(^|\n)([A-ZÀ-Ỹ][^\n]{3,60})\.\n/g,
    //   (_, start, title) => {
    //     return `${start}## ${title}\n`;
    //   }
    // );

    // 4. Convert quotes
    // “text” → > text
    // result = result.replace(/“(.+?)”/g, '> $1');

    // 5. Fix spacing (đọc cho dễ)
    result = result.replace(/\n{3,}/g, '\n\n');

    // 6. Add spacing before headings
    result = result.replace(/\n(## )/g, '\n\n$1');

    return result.trim();
  }
}
