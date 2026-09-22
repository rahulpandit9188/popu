import { streams } from '../data';

export default function BrowseStream({ onExplore }) {
  return (
    <section className="browse-stream">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Choose Your Stream</h2>
        </div>

        <div className="stream-grid">
          {streams.map((stream) => (
            <div className="stream-card" key={stream.title}>
              <div className="stream-icon">{stream.icon}</div>
              <h3 className="stream-title">{stream.title}</h3>
              <p className="stream-subjects">{stream.subjects}</p>
              <a
                href="#subjects"
                className="stream-btn"
                onClick={() => onExplore(stream.title)}
              >
                Explore Stream <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
