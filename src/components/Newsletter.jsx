import { useState } from 'react';

export default function Newsletter({ onSubscribe }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    onSubscribe(email.trim());
    setEmail('');
  };

  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Never Miss New Notes</h2>
          <p className="newsletter-description">
            Get notified when new study materials, questions and quizzes are added.
          </p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="newsletter-btn">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
