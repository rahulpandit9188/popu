import { heroSubjects } from '../data';

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">📚 Complete Study Resources</div>

            <h1 className="hero-title">
              Study Smarter.<br />
              Learn Better.<br />
              <span className="hero-highlight">Score Higher.</span>
            </h1>

            <p className="hero-subtitle">
              Access well-organized notes, important questions, MCQs and study materials for Class 9 to Graduation — all in one place.
            </p>

            <div className="hero-actions">
              <a href="#notes" className="btn-primary">
                Explore Notes <i className="fas fa-arrow-right"></i>
              </a>
              <a href="#classes" className="btn-secondary">
                Browse Classes
              </a>
            </div>

            <p className="trust-statement">
              Class 9 • Class 10 • Class 11 • Class 12 • Graduation
            </p>
          </div>

          <div className="hero-visual">
            <div className="floating-card">10,000+ Notes</div>
            <div className="floating-card">500+ Chapters</div>
            <div className="floating-card">100+ Subjects</div>

            <div className="dashboard-card">
              <div className="dashboard-header">📚 My Study Dashboard</div>
              <div className="dashboard-class">Class 12 • Science</div>

              <div className="subject-list">
                {heroSubjects.map((subject) => (
                  <div className="subject-item" key={subject.name}>
                    <span className="subject-name">{subject.name}</span>
                    <span className="notes-count">{subject.notes}</span>
                  </div>
                ))}
              </div>

              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <div className="progress-text">
                  <span className="progress-label">Your Progress</span>
                  <span className="progress-percentage">75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
