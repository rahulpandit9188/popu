import { useState } from 'react';
import { popularSearches } from '../data';

export default function SearchSection({ onSearch }) {
  const [query, setQuery] = useState('');

  const submitSearch = (value) => {
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <section className="search-section" id="search">
      <div className="container">
        <div className="search-content">
          <h2 className="search-title">What do you want to learn today?</h2>

          <div className="search-box">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search notes, subjects, chapters, topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitSearch(query);
              }}
            />
          </div>

          <div className="popular-searches">
            <p className="popular-label">Popular searches:</p>
            <div className="popular-tags">
              {popularSearches.map((tag) => (
                <a
                  href="#notes"
                  className="popular-tag"
                  key={tag}
                  onClick={() => {
                    setQuery(tag);
                    submitSearch(tag);
                  }}
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
