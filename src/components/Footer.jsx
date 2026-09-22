import { footerColumns, socialLinks } from '../data';

export default function Footer({ onLinkClick }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <a
              href="#home"
              className="footer-logo"
              onClick={(e) => {
                if (onLinkClick?.('#home')) e.preventDefault();
              }}
            >
              <i className="fas fa-graduation-cap"></i>
              StudyNotes
            </a>
            <p className="footer-description">
              Making education simpler, one note at a time. Your trusted companion for academic success.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h4>{column.title}</h4>
              <ul className="footer-links">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (onLinkClick?.(link.href)) e.preventDefault();
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 StudyNotes. All rights reserved.</p>
          <div className="footer-social">
            {socialLinks.map((social) => (
              <a href="#" className="social-link" aria-label={social.label} key={social.label}>
                <i className={social.icon}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
