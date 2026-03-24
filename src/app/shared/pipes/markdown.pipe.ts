import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import { processInlineCitations } from '../../core/utils/reference-processor';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    const html = marked.parse(value, { async: false }) as string;
    return processInlineCitations(html);
  }
}
