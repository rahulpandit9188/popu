import { testimonials } from '../data';

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What Students Say</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <div className="testimonial-card" key={item.name}>
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">“{item.text.replace(/^"|"$/g, '')}”</p>
              <div className="testimonial-author">
                <div className="author-avatar">{item.initial}</div>
                <div className="author-info">
                  <div className="author-name">{item.name}</div>
                  <div className="author-class">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
