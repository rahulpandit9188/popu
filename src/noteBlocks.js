export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatInline(value = '') {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\$([^$]+)\$/g, '\\($1\\)')
    .replace(/\n/g, '<br>');
}

function newId() {
  return crypto.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createBlock(type) {
  if (type === 'heading') return { id: newId(), type, text: '' };
  if (type === 'formula') return {
    id: newId(),
    type,
    latex: '',
    secondaryLatex: '',
  };
  if (type === 'example') return {
    id: newId(),
    type,
    title: 'Example',
    body: '',
    formula: '',
  };
  if (type === 'diagram') return { id: newId(), type, text: '' };
  if (type === 'list') return { id: newId(), type, items: [''] };
  if (type === 'numbered') return { id: newId(), type, items: [''] };
  if (type === 'tip') return { id: newId(), type, text: '' };
  if (type === 'table') {
    return {
      id: newId(),
      type,
      headers: ['Column 1', 'Column 2'],
      rows: [
        ['', ''],
        ['', ''],
      ],
    };
  }
  if (type === 'html') return { id: newId(), type, html: '' };
  return { id: newId(), type: 'paragraph', text: '' };
}

export function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return [];
  return blocks.map((block) => {
    const base = createBlock(block?.type || 'paragraph');
    return {
      ...base,
      ...(block && typeof block === 'object' ? block : {}),
      id: block?.id || base.id,
    };
  });
}

function unwrapLatex(value = '') {
  return value
    .trim()
    .replace(/^\\\(|^\\\[|^\$\$?/, '')
    .replace(/\\\)$|\\\]$|\$\$?$/, '')
    .trim();
}

function nodeText(node) {
  return (node.innerText || node.textContent || '').replace(/\u00a0/g, ' ').trim();
}

function isMarker(line) {
  return (
    /^#{1,3}\s+/.test(line) ||
    /^(FORMULA|EXAMPLE|EXAMPLE-FORMULA|NOTE|TIP|TABLE)\s*:/i.test(line) ||
    /^[-*•]\s+/.test(line) ||
    /^\d+[.)]\s+/.test(line)
  );
}

function looksLikeHeading(line, nextLine) {
  if (!line || line.length > 70 || /[.!?;:]$/.test(line)) return false;
  if (/^[\d\s+\-=/\\()[\]{}.,]+$/.test(line)) return false;
  return Boolean(nextLine && (nextLine.length > line.length || isMarker(nextLine)));
}

function looksLikeFormula(line) {
  if (!line || line.length > 140 || !line.includes('=')) return false;
  const words = line.trim().split(/\s+/);
  return words.length <= 16 && !/[.!?]$/.test(line);
}

function cleanOcrToken(token = '') {
  if (/^w{2,}$/i.test(token)) return 'W';
  return token;
}

function prepareOcrText(rawText = '') {
  const sourceLines = rawText
    .replace(/\r/g, '')
    .replace(/\b(charge)\s+[g9]\s*=/gi, '$1 q =')
    .replace(/\bV\s*=\s*0\s*=\s*(\d+)\s*V\b/g, 'V = $1 V')
    .split('\n');
  const rebuilt = [];

  for (let index = 0; index < sourceLines.length; index += 1) {
    const previous = sourceLines[index - 1]?.trim() || '';
    const middle = sourceLines[index]?.trim() || '';
    const next = sourceLines[index + 1]?.trim() || '';
    const bars = middle.match(/[—–_]+|-{2,}/g) || [];

    if (
      bars.length &&
      middle.includes('=') &&
      previous &&
      next &&
      previous.length <= 60 &&
      next.length <= 60
    ) {
      const numerators = previous.split(/\s+/).map(cleanOcrToken);
      const denominators = next.split(/\s+/).map(cleanOcrToken);

      if (numerators.length >= bars.length && denominators.length >= bars.length) {
        const top = numerators.slice(-bars.length);
        const bottom = denominators.slice(-bars.length);
        let fractionIndex = 0;
        let formula = middle.replace(/[—–_]+|-{2,}/g, () => {
          const fraction = `\\frac{${top[fractionIndex]}}{${bottom[fractionIndex]}}`;
          fractionIndex += 1;
          return fraction;
        });
        formula = formula
          .replace(/(\d)(\\frac)/g, '$1\\,$2')
          .replace(/\b(\d+)\s*([A-Z])\b/g, '$1\\,$2');

        rebuilt.pop();
        rebuilt.push(`FORMULA: ${formula}`);
        index += 1;
        continue;
      }
    }

    rebuilt.push(sourceLines[index]);
  }

  return rebuilt.join('\n');
}

function tableFromLines(lines) {
  const rows = lines
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
    .filter((row) => row.length > 1)
    .filter((row) => !row.every((cell) => /^:?-{2,}:?$/.test(cell)));

  if (!rows.length) return null;
  const headers = rows[0];
  const body = rows.slice(1).map((row) => {
    const next = [...row];
    while (next.length < headers.length) next.push('');
    return next.slice(0, headers.length);
  });
  return {
    ...createBlock('table'),
    headers,
    rows: body.length ? body : [headers.map(() => '')],
  };
}

export function smartTextToBlocks(rawText = '') {
  const lines = prepareOcrText(rawText)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { title: '', blocks: [createBlock('paragraph')] };
  }

  let title = '';
  const first = lines[0];
  if (/^#\s+/.test(first)) {
    title = first.replace(/^#\s+/, '').trim();
    lines.shift();
  } else if (/^\d+[.)]\s+\S+/.test(first) && first.length <= 100) {
    title = first.trim();
    lines.shift();
  } else {
    const numberedTitleIndex = lines
      .slice(0, 6)
      .findIndex((line) => /^\d+[.)]\s+\S+/.test(line) && line.length <= 100);
    if (numberedTitleIndex >= 0) {
      title = lines[numberedTitleIndex];
      lines.splice(numberedTitleIndex, 1);
    }
  }

  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const nextLine = lines[index + 1] || '';

    if (/^#{2,3}\s+/.test(line)) {
      blocks.push({ ...createBlock('heading'), text: line.replace(/^#{2,3}\s+/, '') });
      index += 1;
      continue;
    }

    if (/^FORMULA\s*:/i.test(line)) {
      const formulas = line.replace(/^FORMULA\s*:/i, '').split('||');
      blocks.push({
        ...createBlock('formula'),
        latex: unwrapLatex(formulas[0] || ''),
        secondaryLatex: unwrapLatex(formulas[1] || ''),
      });
      index += 1;
      continue;
    }

    if (/^(NOTE|TIP)\s*:/i.test(line)) {
      blocks.push({
        ...createBlock('tip'),
        text: line.replace(/^(NOTE|TIP)\s*:/i, '').trim(),
      });
      index += 1;
      continue;
    }

    if (/^EXAMPLE\s*:/i.test(line)) {
      const example = createBlock('example');
      example.title = line.replace(/^EXAMPLE\s*:/i, '').trim() || 'Example';
      const body = [];
      index += 1;
      while (index < lines.length && !isMarker(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      example.body = body.join('\n');
      if (index < lines.length && /^EXAMPLE-FORMULA\s*:/i.test(lines[index])) {
        example.formula = unwrapLatex(
          lines[index].replace(/^EXAMPLE-FORMULA\s*:/i, '').trim(),
        );
        index += 1;
      }
      blocks.push(example);
      continue;
    }

    if (/^TABLE\s*:/i.test(line)) {
      const tableLines = [];
      index += 1;
      while (index < lines.length && lines[index].includes('|')) {
        tableLines.push(lines[index]);
        index += 1;
      }
      const table = tableFromLines(tableLines);
      if (table) blocks.push(table);
      continue;
    }

    if (line.includes('|') && nextLine.includes('|')) {
      const tableLines = [];
      while (index < lines.length && lines[index].includes('|')) {
        tableLines.push(lines[index]);
        index += 1;
      }
      const table = tableFromLines(tableLines);
      if (table) blocks.push(table);
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*•]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*•]\s+/, ''));
        index += 1;
      }
      blocks.push({ ...createBlock('list'), items });
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+[.)]\s+/, ''));
        index += 1;
      }
      blocks.push({ ...createBlock('numbered'), items });
      continue;
    }

    if (looksLikeFormula(line)) {
      blocks.push({ ...createBlock('formula'), latex: unwrapLatex(line) });
      index += 1;
      continue;
    }

    if (looksLikeHeading(line, nextLine)) {
      blocks.push({ ...createBlock('heading'), text: line });
      index += 1;
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      !isMarker(lines[index]) &&
      !looksLikeHeading(lines[index], lines[index + 1] || '') &&
      !looksLikeFormula(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push({ ...createBlock('paragraph'), text: paragraph.join('\n') });
  }

  if (!title) {
    const firstHeading = blocks.find((block) => block.type === 'heading');
    if (firstHeading && /^\d+[.)]\s+/.test(firstHeading.text)) {
      title = firstHeading.text;
      blocks.splice(blocks.indexOf(firstHeading), 1);
    }
  }

  return {
    title,
    blocks: blocks.length ? blocks : [createBlock('paragraph')],
  };
}

export function htmlToBlocks(html = '') {
  const value = html.trim();
  if (!value) return [createBlock('paragraph')];
  if (!/<\/?[a-z][\s\S]*>/i.test(value)) {
    return [{ ...createBlock('paragraph'), text: value }];
  }

  const parsed = new DOMParser().parseFromString(`<div id="note-root">${value}</div>`, 'text/html');
  const root = parsed.getElementById('note-root') || parsed.body;
  const blocks = [];

  [...root.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) blocks.push({ ...createBlock('paragraph'), text });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName.toLowerCase();
    const className = node.getAttribute('class') || '';

    if (tag === 'h2' || tag === 'h3') {
      blocks.push({ ...createBlock('heading'), text: nodeText(node) });
      return;
    }
    if (className.includes('note-tip')) {
      blocks.push({ ...createBlock('tip'), text: nodeText(node) });
      return;
    }
    if (tag === 'p') {
      blocks.push({ ...createBlock('paragraph'), text: nodeText(node) });
      return;
    }
    if (className.includes('math-block') || tag === 'div' && node.querySelector('.MathJax, mjx-container')) {
      blocks.push({ ...createBlock('formula'), latex: unwrapLatex(nodeText(node)) });
      return;
    }
    if (className.includes('example-box')) {
      const title = node.querySelector('h4, h3')?.textContent?.trim() || 'Example';
      const clone = node.cloneNode(true);
      const formulaNode = clone.querySelector('.math-block');
      const formula = formulaNode ? unwrapLatex(nodeText(formulaNode)) : '';
      formulaNode?.remove();
      clone.querySelectorAll('h4, h3').forEach((heading) => heading.remove());
      blocks.push({
        ...createBlock('example'),
        title,
        body: nodeText(clone),
        formula,
      });
      return;
    }
    if (className.includes('ascii-figure')) {
      blocks.push({ ...createBlock('diagram'), text: (node.textContent || '').replace(/^\n/, '').replace(/\n$/, '') });
      return;
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = [...node.querySelectorAll(':scope > li')].map((item) => nodeText(item));
      const listBlock = createBlock(tag === 'ol' ? 'numbered' : 'list');
      blocks.push({ ...listBlock, items: items.length ? items : [''] });
      return;
    }
    if (tag === 'table' || className.includes('note-table-wrap') || node.querySelector?.(':scope > table')) {
      const table = tag === 'table' ? node : node.querySelector('table');
      if (table) {
        const allRows = [...table.querySelectorAll('tr')].map((row) => (
          [...row.querySelectorAll('th, td')].map((cell) => nodeText(cell))
        )).filter((row) => row.length);
        if (allRows.length) {
          const headers = allRows[0];
          const rows = allRows.slice(1);
          blocks.push({
            ...createBlock('table'),
            headers,
            rows: rows.length ? rows.map((row) => {
              const next = [...row];
              while (next.length < headers.length) next.push('');
              return next.slice(0, headers.length);
            }) : [headers.map(() => '')],
          });
          return;
        }
      }
    }
    if (tag === 'br') return;

    const leftover = node.outerHTML?.trim();
    if (leftover) blocks.push({ ...createBlock('html'), html: leftover });
  });

  return blocks.length ? blocks : [createBlock('paragraph')];
}

export function blocksToHtml(blocks = []) {
  return blocks
    .map((block) => {
      const text = String(block.text || block.content || '').trim();
      if (block.type === 'heading' && text) {
        return `<h3>${formatInline(text)}</h3>`;
      }
      if ((block.type === 'paragraph' || block.type === 'concept' || block.type === 'summary') && text) {
        return `<p>${formatInline(text)}</p>`;
      }
      if ((block.type === 'definition' || block.type === 'note') && text) {
        return `<p class="note-tip">${formatInline(block.title ? `${block.title}: ${text}` : text)}</p>`;
      }
      if ((block.type === 'question' || block.type === 'try') && text) {
        return `<div class="example-box"><h4>${formatInline(block.title || 'Question')}</h4><p>${formatInline(text)}</p></div>`;
      }
      if ((block.type === 'image' || block.type === 'diagram') && block.url) {
        return `<figure class="ascii-figure"><img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.text || block.title || 'Diagram')}" /></figure>`;
      }
      if (block.type === 'formula' && (block.latex?.trim() || block.secondaryLatex?.trim() || block.content?.trim())) {
        const first = unwrapLatex(block.latex || block.content || '');
        const second = unwrapLatex(block.secondaryLatex || '');
        const formula = first && second
          ? `${first}\\qquad \\text{and} \\qquad ${second}`
          : first || second;
        return `<div class="math-block">\\[${formula}\\]</div>`;
      }
      if (
        block.type === 'example' &&
        (block.title?.trim() || block.body?.trim() || block.content?.trim() || block.formula?.trim())
      ) {
        const exampleFormula = block.formula?.trim()
          ? `<div class="math-block">\\[${unwrapLatex(block.formula)}\\]</div>`
          : '';
        return `<div class="example-box"><h4>${formatInline(block.title || 'Example')}</h4><p>${formatInline(block.body || block.content || '')}</p>${exampleFormula}</div>`;
      }
      if (block.type === 'diagram' && block.text?.trim() && !block.url) {
        return `<div class="ascii-figure">${escapeHtml(block.text)}</div>`;
      }
      if (block.type === 'tip' && text) {
        return `<p class="note-tip">${formatInline(text)}</p>`;
      }
      if (block.type === 'bullet') block = { ...block, type: 'list' };
      if (block.type === 'list' || block.type === 'numbered') {
        const items = (block.items || []).map((item) => item.trim()).filter(Boolean);
        if (!items.length) return '';
        const tag = block.type === 'numbered' ? 'ol' : 'ul';
        return `<${tag}>${items.map((item) => `<li>${formatInline(item)}</li>`).join('')}</${tag}>`;
      }
      if (block.type === 'table') {
        const headers = (block.headers || []).map((cell) => cell.trim());
        const rows = (block.rows || []).filter((row) => row.some((cell) => String(cell || '').trim()));
        if (!headers.some(Boolean) && !rows.length) return '';
        const head = headers.map((cell) => `<th>${formatInline(cell)}</th>`).join('');
        const body = rows.map((row) => `<tr>${headers.map((_, index) => `<td>${formatInline(row[index] || '')}</td>`).join('')}</tr>`).join('');
        return `<div class="note-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
      }
      if (block.type === 'html' && block.html?.trim()) return block.html.trim();
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

export const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: 'fas fa-heading' },
  { type: 'paragraph', label: 'Text', icon: 'fas fa-align-left' },
  { type: 'list', label: 'Bullets', icon: 'fas fa-list-ul' },
  { type: 'numbered', label: '1. 2. 3.', icon: 'fas fa-list-ol' },
  { type: 'formula', label: 'Formula', icon: 'fas fa-superscript' },
  { type: 'example', label: 'Example', icon: 'fas fa-lightbulb' },
  { type: 'diagram', label: 'Diagram', icon: 'fas fa-draw-polygon' },
  { type: 'table', label: 'Table', icon: 'fas fa-table' },
  { type: 'tip', label: 'Tip / Note', icon: 'fas fa-info-circle' },
];
