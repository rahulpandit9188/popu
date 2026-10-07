import { featuredNotes } from '../data';

export default function FeaturedNotes({ onRead, onDownload }) {
  return (
    <section className="featured-notes" id="notes">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Notes</h2>
          <p className="section-subtitle">Start learning with our most popular study resources.</p>
        </div>

        <div className="notes-grid">
          {featuredNotes.map((note) => (
            <div className="note-card" key={note.title}>
              <div className="note-header">
                <div className="note-badge">{note.badge}</div>
                <h3 className="note-title">{note.title}</h3>
                <p className="note-meta">{note.meta}</p>
              </div>
              <div className="note-body">
                <p className="note-description">{note.description}</p>
                <div className="note-actions">
                  <a
                    href="#notes"
                    className="note-btn note-btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      onRead(note.title);
                    }}
                  >
                    Read Notes
                  </a>
                  <a
                    href="#notes"
                    className="note-btn note-btn-secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      onDownload(note.title);
                    }}
                  >
                    <i className="fas fa-list-ol"></i> Test
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
