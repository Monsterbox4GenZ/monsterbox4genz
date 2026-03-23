export interface ParsedReference {
  number: number;
  text: string;
  url: string | null;
}

export interface ExtractedContent {
  body: string;
  references: ParsedReference[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cleanRefText(text: string): string {
  return text
    .replace(/\s*\[Online\]/gi, '')
    .replace(/\s*\[Accessed:\s*[^\]]*\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Splits raw article content into the main body and a parsed reference list.
 * References are detected as consecutive lines matching `[N] ...` at the end
 * of the content, possibly separated by blank lines.
 */
export function extractReferences(content: string): ExtractedContent {
  const lines = content.split('\n');

  let refStartIndex = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed === '') continue;
    if (/^\[\d+\]\s/.test(trimmed)) {
      refStartIndex = i;
    } else {
      break;
    }
  }

  if (refStartIndex >= lines.length) {
    return { body: content, references: [] };
  }

  const body = lines.slice(0, refStartIndex).join('\n').trimEnd();
  const references: ParsedReference[] = [];

  for (let i = refStartIndex; i < lines.length; i++) {
    const match = lines[i].trim().match(/^\[(\d+)\]\s+(.+)$/);
    if (!match) continue;

    const number = parseInt(match[1], 10);
    const rest = match[2];
    const urlMatch = rest.match(/^(.+)\s+-\s+(https?:\/\/.+)$/);

    if (urlMatch) {
      references.push({
        number,
        text: cleanRefText(urlMatch[1]),
        url: urlMatch[2].trim(),
      });
    } else {
      references.push({ number, text: cleanRefText(rest), url: null });
    }
  }

  return { body, references };
}

/**
 * Post-processes HTML to turn literal `[N]` text into clickable superscript
 * anchor links that jump to the corresponding reference item. Skips content
 * inside the references section itself.
 */
export function processInlineCitations(html: string): string {
  const marker = '<section class="references-section">';
  const markerIndex = html.indexOf(marker);

  let bodyHtml = markerIndex !== -1 ? html.substring(0, markerIndex) : html;
  const refHtml = markerIndex !== -1 ? html.substring(markerIndex) : '';

  const seen = new Set<string>();
  bodyHtml = bodyHtml.replace(/\[(\d+)\]/g, (_, num) => {
    const idAttr = seen.has(num) ? '' : ` id="cite-${num}"`;
    seen.add(num);
    return `<sup${idAttr}><a href="#ref-${num}" class="citation-link">[${num}]</a></sup>`;
  });

  return bodyHtml + refHtml;
}

/**
 * Builds a styled HTML references section from parsed references.
 */
export function formatReferencesSection(
  references: ParsedReference[],
  title: string,
): string {
  if (references.length === 0) return '';

  const items = references
    .map((ref) => {
      const textHtml = escapeHtml(ref.text);
      const urlHtml = ref.url
        ? ` <a href="${ref.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.url)}</a>`
        : '';
      return `<div id="ref-${ref.number}" class="reference-item"><a href="#cite-${ref.number}" class="ref-back-link">[${ref.number}]</a> ${textHtml}${urlHtml}</div>`;
    })
    .join('\n');

  return `\n\n<section class="references-section">\n<h3>${escapeHtml(title)}</h3>\n${items}\n</section>`;
}
