export default function BrowseClass({ classes = [], loading = false, error = '', onExplore }) {
  return (
    <section className="browse-class" id="classes">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Browse Notes by Class</h2>
          <p className="section-subtitle">Find study materials designed for your academic level.</p>
        </div>

        {loading ? <p className="section-subtitle">Loading classes...</p> : null}
        {error ? <p className="auth-error">{error}</p> : null}

        <div className="class-grid">
          {classes.map((item) => (
            <div className="class-card" key={item.uuid}>
              <div className="class-number">{item.class_name.replace(/\D/g, '') || '🎓'}</div>
              <h3 className="class-title">{item.class_name}</h3>
              <p className="class-description">{item.description}</p>
              <p className="class-info">{item.medium} Medium</p>
              <button className="class-btn" type="button" onClick={() => onExplore(item)}>
                Explore {item.class_name}
              </button>
            </div>
          ))}
        </div>
        {!loading && !error && classes.length === 0 ? (
          <p className="section-subtitle">No classes are available yet.</p>
        ) : null}
      </div>
    </section>
  );
}
