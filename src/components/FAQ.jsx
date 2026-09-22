import { useState } from 'react';
import { faqs } from '../data';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="faq">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-container">
          {faqs.map((item, index) => (
            <div className={`faq-item${openIndex === index ? ' active' : ''}`} key={item.question}>
              <button className="faq-question" type="button" onClick={() => toggle(index)}>
                {item.question}
                <i className="fas fa-chevron-down faq-icon"></i>
              </button>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
