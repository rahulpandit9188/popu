import katex from 'katex';

export function subjectIcon(name = '') {
  const value = name.toLowerCase();
  if (value.includes('math')) return 'fas fa-square-root-alt';
  if (value.includes('physics')) return 'fas fa-atom';
  if (value.includes('chem')) return 'fas fa-flask';
  if (value.includes('bio')) return 'fas fa-dna';
  if (value.includes('english')) return 'fas fa-language';
  if (value.includes('hindi')) return 'fas fa-book';
  if (value.includes('history')) return 'fas fa-landmark';
  if (value.includes('geo')) return 'fas fa-globe-asia';
  if (value.includes('politic') || value.includes('civics')) return 'fas fa-balance-scale';
  if (value.includes('econom')) return 'fas fa-chart-line';
  if (value.includes('computer')) return 'fas fa-laptop-code';
  return 'fas fa-book-open';
}

export function blockText(block = {}) {
  return block.text || block.content || block.body || block.latex || '';
}

export function Latex({ value, display = true }) {
  if (!value) return null;
  const html = katex.renderToString(String(value), { throwOnError: false, displayMode: display });
  return <div className="study-latex" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ProgressBar({ percent = 0, label }) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="study-progress">
      <div className="study-progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
        <span style={{ width: `${value}%` }} />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}

export function SubjectCard({ subject, onOpen }) {
  const chapters = subject.chapter_count ?? subject.chapters ?? 0;
  const loggedIn = subject.total !== undefined;
  return (
    <button className="study-subject-card" type="button" onClick={() => onOpen(subject)}>
      <span className="study-subject-icon">
        <i className={subject.icon || subjectIcon(subject.subject_name)} />
      </span>
      <span>
        <strong>{subject.subject_name}</strong>
        <small>{chapters} {chapters === 1 ? 'chapter' : 'chapters'}</small>
      </span>
      {loggedIn ? (
        <>
          <ProgressBar percent={subject.percent} label={`${subject.subject_name} progress`} />
          <em>{subject.completed || 0} / {subject.total || 0} topics</em>
        </>
      ) : (
        <em>Open to start reading</em>
      )}
    </button>
  );
}

export function SearchBar({ value, onChange, onSubmit, placeholder = 'Search subjects, chapters, topics, formulas' }) {
  return (
    <form
      className="study-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <i className="fas fa-search" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search study notes"
      />
    </form>
  );
}

export function BookmarkButton({ active, onClick, label = 'Bookmark' }) {
  return (
    <button className={`study-icon-btn${active ? ' active' : ''}`} type="button" onClick={onClick} aria-pressed={active}>
      <i className={`${active ? 'fas' : 'far'} fa-bookmark`} />
      {label}
    </button>
  );
}

const BLOCK_CLASS = {
  concept: 'concept',
  definition: 'definition',
  paragraph: 'concept',
  heading: 'plain',
  summary: 'summary',
  formula: 'formula',
  example: 'example',
  note: 'note',
  tip: 'tip',
  table: 'table',
  diagram: 'image',
  image: 'image',
  question: 'question',
  try: 'try',
  list: 'concept',
  bullet: 'concept',
  numbered: 'concept',
};

const BLOCK_LABEL = {
  concept: 'Concept',
  definition: 'Definition',
  paragraph: 'Concept',
  summary: 'Summary',
  formula: 'Formula',
  example: 'Solved Example',
  note: 'Important Note',
  tip: 'Quick Tip',
  table: 'Table',
  diagram: 'Diagram',
  image: 'Diagram',
  question: 'Practice Question',
  try: 'Try Yourself',
  list: 'Concept',
  bullet: 'Concept',
  numbered: 'Concept',
  heading: '',
};

export function ContentBlocks({ blocks = [], onCopy, savedIds = [], onBookmark, subjectUsesLatex = false }) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return <p className="study-empty">This topic does not have published blocks yet.</p>;
  }

  return (
    <div className="study-blocks">
      {blocks.map((block, index) => {
        const kind = BLOCK_CLASS[block.type] || 'concept';
        const label = BLOCK_LABEL[block.type] || 'Note';
        const anchor = `block-${block.id || index}`;
        const text = blockText(block);
        const showLatex = block.type === 'formula' || (subjectUsesLatex && block.formula);
        return (
          <article id={anchor} className={`study-block study-block-${kind}`} key={block.id || index}>
            {label ? <span className="study-block-label">{block.title && block.type !== 'example' && block.type !== 'formula' ? block.title : label}</span> : null}
            {block.type === 'heading' ? <h2>{text}</h2> : null}
            {block.type === 'formula' ? (
              <>
                {block.title ? <h3>{block.title}</h3> : null}
                <div className="study-formula-scroll">
                  <Latex value={block.latex || block.content} />
                  {block.secondaryLatex ? <Latex value={block.secondaryLatex} /> : null}
                </div>
                <div className="study-inline-actions">
                  <button type="button" className="study-icon-btn" onClick={() => onCopy?.(block.latex || block.content)}>
                    <i className="fas fa-copy" /> Copy Formula
                  </button>
                  <BookmarkButton
                    active={savedIds.includes(String(block.id))}
                    label="Bookmark"
                    onClick={() => onBookmark?.({
                      target_type: 'formula',
                      target_id: String(block.id),
                      title: block.title || block.latex || 'Formula',
                    })}
                  />
                </div>
              </>
            ) : null}
            {block.type === 'example' ? (
              <>
                <h3>{block.title || 'Example'}</h3>
                <p>{block.body || block.content}</p>
                {block.formula ? (
                  <div className="study-formula-scroll">
                    <Latex value={block.formula} />
                  </div>
                ) : null}
                <BookmarkButton
                  active={savedIds.includes(String(block.id))}
                  onClick={() => onBookmark?.({
                    target_type: 'example',
                    target_id: String(block.id),
                    title: block.title || 'Example',
                  })}
                />
              </>
            ) : null}
            {block.type === 'table' ? (
              <div className="study-table-scroll">
                <table>
                  <thead>
                    <tr>{(block.headers || []).map((cell) => <th key={cell}>{cell}</th>)}</tr>
                  </thead>
                  <tbody>
                    {(block.rows || []).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {(block.headers || row).map((_, cellIndex) => <td key={cellIndex}>{row[cellIndex]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {(block.type === 'image' || block.type === 'diagram') && block.url ? (
              <figure>
                <img src={block.url} alt={block.text || block.title || 'Diagram'} />
                {block.text ? <figcaption>{block.text}</figcaption> : null}
              </figure>
            ) : null}
            {(block.type === 'list' || block.type === 'bullet' || block.type === 'numbered') ? (
              block.type === 'numbered'
                ? <ol>{(block.items || []).map((item) => <li key={item}>{item}</li>)}</ol>
                : <ul>{(block.items || []).map((item) => <li key={item}>{item}</li>)}</ul>
            ) : null}
            {!['heading', 'formula', 'example', 'table', 'image', 'diagram', 'list', 'bullet', 'numbered'].includes(block.type) ? (
              <>
                {block.title && block.type !== 'paragraph' ? <h3>{block.title}</h3> : null}
                <p>{text}</p>
                {showLatex && block.formula ? <Latex value={block.formula} /> : null}
                {block.answer ? <p className="study-answer"><strong>Answer. </strong>{block.answer}</p> : null}
              </>
            ) : null}
            {block.type === 'diagram' && !block.url && block.text ? <pre className="study-ascii">{block.text}</pre> : null}
          </article>
        );
      })}
    </div>
  );
}

export function pageSections(blocks = []) {
  return (Array.isArray(blocks) ? blocks : [])
    .map((block, index) => ({
      id: `block-${block.id || index}`,
      label: block.title || blockText(block).slice(0, 48) || BLOCK_LABEL[block.type] || 'Section',
      type: block.type,
    }))
    .filter((item) => item.label);
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="study-empty-card">
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="study-skeleton-grid" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => <span className="study-skeleton" key={index} />)}
    </div>
  );
}
