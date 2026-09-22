import { subjects } from '../data';

export default function PopularSubjects({ onSelect }) {
  return (
    <section className="popular-subjects" id="subjects">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Popular Subjects</h2>
        </div>

        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div
              className="subject-card"
              key={subject.name}
              onClick={() => onSelect(subject.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(subject.name);
              }}
            >
              <div className="subject-icon">
                <i className={subject.icon}></i>
              </div>
              <div className="subject-info">
                <h4 className="subject-name">{subject.name}</h4>
                <p className="subject-count">{subject.count}</p>
              </div>
              <i className="fas fa-arrow-right subject-arrow"></i>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
