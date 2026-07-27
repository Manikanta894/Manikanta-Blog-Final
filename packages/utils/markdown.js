// Shared markdown → HTML renderer.
// Used server-side (article page, for SEO-visible HTML) and client-side
// (admin editor live preview) so both always render identically.
//
// Supports: # ## ### headings, **bold**, *italic*, `code`, ```code fences```,
// ![alt](src) images, [text](url) links, - / * unordered lists, 1. ordered
// lists, > blockquotes, --- horizontal rules, | pipe | tables |, paragraphs.
// Deliberately dependency-free (no remark/marked) to keep the app zero-cost
// and framework-agnostic.
//
// Editorial-structure helpers (added):
//   extractHeadings()          — H2/H3 outline for the sticky mini TOC.
//   ensureEditorialStructure() — guarantees every article — old ones
//                                 rendered from data that predates this pass
//                                 included — gets at least one visually
//                                 distinct pull-quote and a Key Takeaways
//                                 callout, even if the source markdown never
//                                 had them.

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

// ─── heading ids (anchor targets for the mini TOC) ────────────────────────
export function slugifyHeading(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'section';
}

const TAKEAWAY_RE = /^(key takeaways?|main takeaways?|takeaways?|tl;?dr|the bottom line|summary)$/i;

function makeIdCounter() {
  const seen = new Map();
  return (text) => {
    const base = slugifyHeading(text);
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };
}

// H2/H3 outline used by the sticky mini table-of-contents. Operates on raw
// markdown (not the rendered HTML) so it can run before/without a full
// render. Skips the auto-managed "Key Takeaways" section — it's a callout,
// not a reading step.
export function extractHeadings(md) {
  if (!md) return [];
  const nextId = makeIdCounter();
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inFence = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim().startsWith('```')) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m2 = line.match(/^##\s+(.+)$/);
    const m3 = line.match(/^###\s+(.+)$/);
    if (m2 && !TAKEAWAY_RE.test(m2[1].trim())) {
      out.push({ level: 2, text: m2[1].trim(), id: nextId(m2[1].trim()) });
    } else if (m3) {
      out.push({ level: 3, text: m3[1].trim(), id: nextId(m3[1].trim()) });
    }
  }
  return out;
}

// ─── auto-structure guarantees (pull-quotes + Key Takeaways) ─────────────

function stripInlineMd(s) {
  return String(s || '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim();
}

// Picks a strong, self-contained, quotable sentence out of the plain
// paragraph text of the article (never from lists/headings/code/images).
// Prefers sentences with some specificity (numbers, colons, em-dashes) over
// generic ones, and avoids sentences that are too short or too long to read
// well set in large display type.
function extractStrongSentence(md, usedSentences) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const paragraphs = [];
  let inFence = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('```')) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (!line) continue;
    if (/^#{1,4}\s/.test(line)) continue;
    if (/^[-*]\s/.test(line)) continue;
    if (/^\d+\.\s/.test(line)) continue;
    if (line.startsWith('>')) continue;
    if (/^!\[/.test(line)) continue;
    if (line.includes('|')) continue;
    paragraphs.push(stripInlineMd(line));
  }
  const sentences = [];
  for (const p of paragraphs) {
    for (const s of p.split(/(?<=[.!?])\s+/)) {
      const t = s.trim();
      if (t.length >= 55 && t.length <= 165 && !usedSentences.has(t)) sentences.push(t);
    }
  }
  if (!sentences.length) return null;
  const scored = sentences.map((s) => ({
    s,
    score: (/\d/.test(s) ? 2 : 0) + (/[:—-]/.test(s) ? 1 : 0) + (s.length >= 70 && s.length <= 130 ? 1 : 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  const pick = scored[0].s;
  usedSentences.add(pick);
  return /[.!?]$/.test(pick) ? pick : `${pick}.`;
}

function countBlockquotes(md) {
  let n = 0, inFence = false;
  for (const raw of md.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```')) { inFence = !inFence; continue; }
    if (!inFence && line.startsWith('> ')) n++;
  }
  return n;
}

function insertAfterLineFraction(lines, fraction) {
  const target = Math.max(1, Math.floor(lines.length * fraction));
  let inFence = false;
  for (let i = Math.min(target, lines.length - 1); i < lines.length; i++) {
    const l = lines[i];
    if (l.trim().startsWith('```')) { inFence = !inFence; continue; }
    if (inFence) continue;
    const prev = (lines[i - 1] || '').trim();
    if (l.trim() === '' && prev && !prev.startsWith('#') && !prev.startsWith('>') && !/^[-*\d]/.test(prev)) {
      return i;
    }
  }
  return lines.length;
}

function hasKeyTakeaways(md) {
  return md.split('\n').some((l) => {
    const m = l.trim().match(/^##\s+(.+)$/);
    return m && TAKEAWAY_RE.test(m[1].trim());
  });
}

function autoKeyTakeaways(md) {
  // Best-effort: pull the first sentence out of each H2 section's opening
  // paragraph as a fallback takeaway when the source article never had one
  // (older articles generated before this section was standard).
  const sections = md.split(/\n(?=##\s+)/);
  const bullets = [];
  for (const sec of sections) {
    const lines = sec.split('\n');
    const heading = (lines[0].match(/^##\s+(.+)$/) || [])[1];
    if (!heading || TAKEAWAY_RE.test(heading.trim()) || /^(frequently asked questions|faq)/i.test(heading.trim())) continue;
    const bodyLine = lines.slice(1).find((l) => l.trim() && !/^#{1,4}\s/.test(l.trim()) && !/^[-*\d]/.test(l.trim()) && !l.trim().startsWith('>') && !/^!\[/.test(l.trim()));
    if (!bodyLine) continue;
    const firstSentence = stripInlineMd(bodyLine).split(/(?<=[.!?])\s+/)[0];
    if (firstSentence && firstSentence.length > 20) {
      bullets.push(firstSentence.length > 140 ? firstSentence.slice(0, 137).trim() + '…' : firstSentence);
    }
    if (bullets.length >= 5) break;
  }
  if (bullets.length < 3) return null;
  return `\n\n## Key Takeaways\n${bullets.map((b) => `- ${b}`).join('\n')}\n`;
}

// Guarantees the two structural elements this redesign requires on every
// article — old and new — regardless of what the source markdown contains:
//   1. At least one pull-quote blockquote, placed inside the body (never
//      the very first line), auto-extracted from the article's own text
//      when the markdown doesn't already have one.
//   2. A "## Key Takeaways" section, auto-summarized when missing, which
//      renderMd() below turns into the boxed callout instead of a plain list.
export function ensureEditorialStructure(md) {
  if (!md || !md.trim()) return md;
  let content = md;
  const used = new Set();

  const existingQuotes = countBlockquotes(content);
  const wordCount = content.split(/\s+/).length;
  const targetQuotes = wordCount > 1100 ? 2 : 1;

  const quotesToAdd = Math.max(0, targetQuotes - existingQuotes);
  const fractions = [0.38, 0.68];
  for (let n = 0; n < quotesToAdd; n++) {
    const sentence = extractStrongSentence(content, used);
    if (!sentence) break;
    const lines = content.split('\n');
    const at = insertAfterLineFraction(lines, fractions[n] ?? 0.5);
    lines.splice(at, 0, '', `> ${sentence}`, '');
    content = lines.join('\n');
  }

  if (!hasKeyTakeaways(content)) {
    const block = autoKeyTakeaways(content);
    if (block) content = content.replace(/\s*$/, '') + block;
  }

  return content;
}

export function renderMd(md) {
  if (!md) return '';
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let i = 0;
  let inUl = false;
  let inOl = false;
  const nextId = makeIdCounter();

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

    // "## Key Takeaways" (and equivalents) — render as a boxed callout
    // instead of a plain heading + bullet list, and consume the list that
    // follows it so it doesn't also get rendered a second time below.
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match && TAKEAWAY_RE.test(h2Match[1].trim())) {
      closeLists();
      const label = inline(h2Match[1].trim());
      i++;
      while (i < lines.length && lines[i].trim() === '') i++;
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      if (items.length === 0) {
        while (i < lines.length && lines[i].trim() !== '' && !/^#{1,4}\s/.test(lines[i].trim())) {
          items.push(lines[i].trim());
          i++;
        }
      }
      html += `<div class="callout-box"><div class="callout-box__label">${label}</div><ul class="callout-box__list">` +
        items.map((it) => `<li>${inline(it)}</li>`).join('') +
        '</ul></div>';
      continue;
    }

    if (line.startsWith('#### ')) { closeLists(); html += `<h4>${inline(line.slice(5))}</h4>`; i++; continue; }
    if (line.startsWith('### ')) {
      closeLists();
      const text = line.slice(4);
      html += `<h3 id="${nextId(text)}">${inline(text)}</h3>`;
      i++; continue;
    }
    if (h2Match) {
      closeLists();
      const text = h2Match[1];
      html += `<h2 id="${nextId(text)}">${inline(text)}</h2>`;
      i++; continue;
    }
    if (line.startsWith('# '))   { closeLists(); html += `<h1 class="text-h1 italic mt-8 mb-6">${inline(line.slice(2))}</h1>`; i++; continue; }

    if (/^(---|\*\*\*|___)\s*$/.test(line.trim())) { closeLists(); html += '<hr/>'; i++; continue; }

    if (line.startsWith('> ')) {
      closeLists();
      const buf = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith('> ')) { buf.push(lines[i].slice(2)); i++; }
      html += `<blockquote class="pull-quote"><span class="pull-quote__mark" aria-hidden="true">&#8220;</span>${buf.map((b) => `<p>${inline(b)}</p>`).join('')}</blockquote>`;
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
