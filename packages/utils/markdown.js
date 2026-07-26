// Shared markdown → HTML renderer.
// Used server-side (article page, for SEO-visible HTML) and client-side
// (admin editor live preview) so both always render identically.
//
// Supports: # ## ### headings, **bold**, *italic*, `code`, ```code fences```,
// ![alt](src) images, [text](url) links, - / * unordered lists, 1. ordered
// lists, > blockquotes, --- horizontal rules, | pipe | tables |, paragraphs.
// Deliberately dependency-free (no remark/marked) to keep the app zero-cost
// and framework-agnostic.

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(s) {
  let out = esc(s);
  // images must run before links (both use brackets+parens)
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (m, alt, src, title) => {
    const t = title ? ` title="${esc(title)}"` : '';
    return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"${t} />`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (m, text, href, title) => {
    const t = title ? ` title="${esc(title)}"` : '';
    const external = /^https?:\/\//i.test(href);
    const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${esc(href)}"${t}${rel}>${text}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
}

function isTableSeparator(line) {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-');
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

export function renderMd(md) {
  if (!md) return '';
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let i = 0;
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { html += '</ul>'; inUl = false; }
    if (inOl) { html += '</ol>'; inOl = false; }
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // fenced code block
    if (line.trim().startsWith('```')) {
      closeLists();
      const lang = line.trim().slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++; }
      html += `<pre><code${lang ? ` class="language-${esc(lang)}"` : ''}>${esc(buf.join('\n'))}</code></pre>`;
      i++; // skip closing fence
      continue;
    }

    // table: header line + separator line
    if (line.includes('|') && lines[i + 1] && isTableSeparator(lines[i + 1])) {
      closeLists();
      const header = parseTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim() !== '') {
        rows.push(parseTableRow(lines[i]));
        i++;
      }
      html += '<div class="table-wrap"><table><thead><tr>' +
        header.map((h) => `<th>${inline(h)}</th>`).join('') +
        '</tr></thead><tbody>' +
        rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('') +
        '</tbody></table></div>';
      continue;
    }

    if (line.startsWith('#### ')) { closeLists(); html += `<h4>${inline(line.slice(5))}</h4>`; i++; continue; }
    if (line.startsWith('### ')) { closeLists(); html += `<h3>${inline(line.slice(4))}</h3>`; i++; continue; }
    if (line.startsWith('## '))  { closeLists(); html += `<h2>${inline(line.slice(3))}</h2>`; i++; continue; }
    if (line.startsWith('# '))   { closeLists(); html += `<h1 class="text-h1 italic mt-8 mb-6">${inline(line.slice(2))}</h1>`; i++; continue; }

    if (/^(---|\*\*\*|___)\s*$/.test(line.trim())) { closeLists(); html += '<hr/>'; i++; continue; }

    if (line.startsWith('> ')) {
      closeLists();
      const buf = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith('> ')) { buf.push(lines[i].slice(2)); i++; }
      html += `<blockquote>${buf.map((b) => inline(b)).join('<br/>')}</blockquote>`;
      continue;
    }

    // standalone image line, e.g. ![alt](url)
    if (/^!\[[^\]]*\]\([^)]+\)\s*$/.test(line.trim())) {
      closeLists();
      html += `<figure class="article-figure">${inline(line.trim())}</figure>`;
      i++;
      continue;
    }

    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!inOl) { closeLists(); html += '<ol>'; inOl = true; }
      html += `<li>${inline(olMatch[2])}</li>`;
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      if (!inUl) { closeLists(); html += '<ul>'; inUl = true; }
      html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`;
      i++;
      continue;
    }

    if (line.trim() === '') { closeLists(); i++; continue; }

    closeLists();
    html += `<p>${inline(line)}</p>`;
    i++;
  }
  closeLists();
  return html;
}

// Plain-text excerpt from markdown (for meta descriptions / previews).
export function mdToText(md, maxLen = 160) {
  if (!md) return '';
  const text = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*`_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen - 1).trim() + '\u2026' : text;
}
