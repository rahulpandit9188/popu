import { useEffect, useState } from 'react';
import { navLinks } from '../data';

export default function Navbar({
  onSearchClick,
  onLogin,
  onSignup,
  onLogout,
  onProfile,
  onBookmarks,
  onDashboard,
  onHome,
  onNavigate,
  isClassPage,
  isAuthPage,
  isProfilePage,
  isBookmarksPage,
  isDashboardPage,
  user,
  bookmarkCount = 0,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('#home');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isClassPage) {
      setActiveHref('#classes');
      return undefined;
    }
    if (isAuthPage || isProfilePage || isBookmarksPage || isDashboardPage) {
      setActiveHref('');
      return undefined;
    }

    const updateActive = () => {
      let current = '#home';
      navLinks.forEach((link) => {
        const section = document.getElementById(link.href.slice(1));
        if (section && section.getBoundingClientRect().top <= 140) {
          current = link.href;
        }
      });
      setActiveHref(current);
    };

    updateActive();
    window.addEventListener('scroll', updateActive);
    return () => window.removeEventListener('scroll', updateActive);
  }, [isClassPage, isAuthPage, isProfilePage, isBookmarksPage, isDashboardPage]);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-container">
        <a
          href="#home"
          className="nav-logo"
          onClick={(e) => {
            if (onHome) {
              e.preventDefault();
              onHome();
            }
            setActiveHref('#home');
            setMenuOpen(false);
          }}
        >
          <i className="fas fa-graduation-cap"></i>
          StudyNotes
        </a>

        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={activeHref === link.href ? 'active' : ''}
                onClick={(e) => {
                  setMenuOpen(false);
                  setActiveHref(link.href);
                  if (onNavigate?.(link.href)) e.preventDefault();
                }}
              >
                <i className={link.icon}></i>
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button className="search-btn nav-search-action" type="button" onClick={onSearchClick} aria-label="Search">
            <i className="fas fa-search"></i>
          </button>
          {user ? (
            <>
              {user.is_staff ? (
                <button className="login-btn nav-dashboard-action" type="button" onClick={onDashboard} aria-label="Dashboard">
                  <i className="fas fa-chart-line"></i>
                  Dashboard
                </button>
              ) : null}
              <button
                className="search-btn nav-bookmark-action"
                type="button"
                onClick={onBookmarks}
                aria-label="Bookmarks"
              >
                <i className="fas fa-bookmark"></i>
                {bookmarkCount ? <span className="nav-badge">{bookmarkCount}</span> : null}
              </button>
              <button className="nav-user nav-profile-action" type="button" onClick={onProfile}>
                <i className="fas fa-user"></i>
                {user.name}
              </button>
              <button className="login-btn nav-logout-action" type="button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="login-btn" type="button" onClick={onLogin}>
                Login
              </button>
              <button className="signup-btn" type="button" onClick={onSignup}>
                Sign Up
                <i className="fas fa-arrow-right"></i>
              </button>
            </>
          )}
          <button
            className="mobile-menu"
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
