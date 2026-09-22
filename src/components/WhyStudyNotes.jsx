import { features } from '../data';

export default function WhyStudyNotes() {
  return (
    <section className="why-studynotes" id="mcqs">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Everything You Need to Study Better</h2>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
