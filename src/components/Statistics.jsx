import { useEffect, useRef, useState } from 'react';
import { stats } from '../data';

function formatCount(value) {
  return `${value.toLocaleString()}+`;
}

export default function Statistics() {
  const sectionRef = useRef(null);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [animate, setAnimate] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          setAnimate(true);
        }
      });
    });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animate) return undefined;

    const speed = 100;
    const increments = stats.map((stat) => stat.target / speed);
    let current = stats.map(() => 0);
    let frameId;

    const update = () => {
      let done = true;
      current = current.map((value, index) => {
        const next = value + increments[index];
        if (next < stats[index].target) {
          done = false;
          return next;
        }
        return stats[index].target;
      });

      setCounts(current.map((value, index) =>
        value >= stats[index].target ? stats[index].target : Math.floor(value)
      ));

      if (!done) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [animate]);

  return (
    <section className="statistics" ref={sectionRef}>
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-item" key={stat.label}>
              <div className={`stat-number${animate ? ' animate' : ''}`}>
                {formatCount(counts[index])}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
