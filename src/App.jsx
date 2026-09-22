import { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SearchSection from './components/SearchSection';
import BrowseClass from './components/BrowseClass';
import BrowseStream from './components/BrowseStream';
import PopularSubjects from './components/PopularSubjects';
import FeaturedNotes from './components/FeaturedNotes';
import WhyStudyNotes from './components/WhyStudyNotes';
import HowItWorks from './components/HowItWorks';
import Statistics from './components/Statistics';
import ExamCTA from './components/ExamCTA';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import ClassPage from './components/ApiClassPage';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import BookmarksPage from './components/BookmarksPage';
import { classPageKeys } from './data';
import { readBookmarks, toggleBookmark } from './bookmarks';
import { academicsApi } from './api/client';
import { logoutSession, readSession } from './session';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

export default function App() {
  const [toast, setToast] = useState('');
  const [activeClass, setActiveClass] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [user, setUser] = useState(readSession);
  const [showDashboard, setShowDashboard] = useState(
    () => Boolean(readSession()?.is_staff),
  );
  const [bookmarks, setBookmarks] = useState(() => readBookmarks(readSession()?.email));
  const [openTarget, setOpenTarget] = useState(null);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState('');

  useEffect(() => {
    const syncSession = () => setUser(readSession());
    window.addEventListener('session-updated', syncSession);
    return () => window.removeEventListener('session-updated', syncSession);
  }, []);

  useEffect(() => {
    academicsApi
      .classes()
      .then((response) => setSchoolClasses(response.data || []))
      .catch((error) => setClassesError(error.message))
      .finally(() => setClassesLoading(false));
  }, []);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const goHome = (hash) => {
    setActiveClass(null);
    setAuthMode(null);
    setShowProfile(false);
    setShowBookmarks(false);
    setShowDashboard(false);
    setOpenTarget(null);
    window.setTimeout(() => {
      if (!hash || hash === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const openAuth = (mode) => {
    setActiveClass(null);
    setShowProfile(false);
    setShowBookmarks(false);
    setShowDashboard(false);
    setOpenTarget(null);
    setAuthMode(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProfile = () => {
    setActiveClass(null);
    setAuthMode(null);
    setShowBookmarks(false);
    setShowDashboard(false);
    setOpenTarget(null);
    setShowProfile(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBookmarks = () => {
    if (!user) {
      showToast('Please login to view bookmarks.');
      openAuth('login');
      return;
    }
    setActiveClass(null);
    setAuthMode(null);
    setShowProfile(false);
    setShowDashboard(false);
    setOpenTarget(null);
    setShowBookmarks(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openClass = (classReference, target = null) => {
    const schoolClass =
      typeof classReference === 'object'
        ? classReference
        : schoolClasses.find(
            (item) =>
              item.class_name.toLowerCase() === String(classReference).toLowerCase() ||
              item.title.toLowerCase() === String(classReference).toLowerCase(),
          );

    if (schoolClass) {
      setAuthMode(null);
      setShowProfile(false);
      setShowBookmarks(false);
      setShowDashboard(false);
      setOpenTarget(target);
      setActiveClass(schoolClass);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    showToast(`No backend data found for ${classReference}`);
  };

  const openDashboard = () => {
    if (!user?.is_staff) {
      showToast('Staff account required.');
      return;
    }
    setActiveClass(null);
    setAuthMode(null);
    setShowProfile(false);
    setShowBookmarks(false);
    setOpenTarget(null);
    setShowDashboard(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBookmark = (item) => {
    if (!user) {
      showToast('Please login to save bookmarks.');
      openAuth('login');
      return;
    }
    const result = toggleBookmark(user.email, item);
    setBookmarks(result.bookmarks);
    showToast(result.added ? 'Saved to bookmarks.' : 'Removed from bookmarks.');
  };

  const handleLogout = async () => {
    try {
      await logoutSession();
    } catch {
      // The local session is still cleared when the API is unavailable.
    }
    setUser(null);
    setBookmarks([]);
    setShowProfile(false);
    setShowBookmarks(false);
    setShowDashboard(false);
    setAuthMode(null);
    showToast('You have been logged out.');
  };

  const handleNavigate = (href) => {
    const id = href.replace('#', '');
    if (classPageKeys[id]) {
      openClass(classPageKeys[id]);
      return true;
    }
    if (activeClass || authMode || showProfile || showBookmarks || showDashboard) {
      goHome(id);
      return true;
    }
    return false;
  };

  const scrollToSearch = () => {
    if (activeClass || authMode || showProfile || showBookmarks || showDashboard) {
      goHome('search');
      return;
    }
    document.getElementById('search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const classData = activeClass;
  const onSpecialPage = Boolean(
    authMode || classData || showProfile || showBookmarks || showDashboard,
  );

  return (
    <>
      <Navbar
        onSearchClick={scrollToSearch}
        onLogin={() => openAuth('login')}
        onSignup={() => openAuth('signup')}
        onProfile={openProfile}
        onBookmarks={openBookmarks}
        onDashboard={openDashboard}
        bookmarkCount={bookmarks.length}
        onLogout={handleLogout}
        onHome={() => goHome('home')}
        onNavigate={handleNavigate}
        isClassPage={Boolean(classData)}
        isAuthPage={Boolean(authMode)}
        isProfilePage={showProfile}
        isBookmarksPage={showBookmarks}
        isDashboardPage={showDashboard}
        user={user}
      />
      {authMode ? (
        <AuthPage
          mode={authMode}
          onSwitch={setAuthMode}
          onBack={() => goHome('home')}
          onSuccess={(session, message) => {
            setUser(session);
            setBookmarks(readBookmarks(session.email));
            setAuthMode(null);
            setShowDashboard(Boolean(session.is_staff));
            setShowProfile(!session.is_staff);
            showToast(message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : showDashboard && user?.is_staff ? (
        <Suspense fallback={<main className="admin-dashboard">Loading dashboard…</main>}>
          <AdminDashboard
            user={user}
            onBack={() => goHome('home')}
            onOpenClass={openClass}
          />
        </Suspense>
      ) : showBookmarks ? (
        <BookmarksPage
          bookmarks={bookmarks}
          medium={user?.medium || 'English'}
          onBack={() => goHome('home')}
          onOpenBookmark={(item) =>
            openClass(item.classTitle, { subject: item.subject, chapter: item.chapterTitle })
          }
          onToggleBookmark={handleToggleBookmark}
        />
      ) : showProfile && user ? (
        <ProfilePage
          user={user}
          classes={schoolClasses}
          onBack={() => goHome('home')}
          onLogout={handleLogout}
          onExploreClass={openClass}
          onSaved={(nextUser, message) => {
            setUser(nextUser);
            showToast(message);
          }}
        />
      ) : classData ? (
        <ClassPage
          classData={classData}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          initialSubject={openTarget?.subject}
          initialChapter={openTarget?.chapter}
          medium={user?.medium || 'English'}
          onBack={() => goHome('classes')}
          onDownload={(title) => showToast(`Downloading PDF: ${title}`)}
        />
      ) : (
        <>
          <Hero />
          <SearchSection onSearch={(query) => showToast(`Searching for: ${query}`)} />
          <BrowseClass
            classes={schoolClasses}
            loading={classesLoading}
            error={classesError}
            onExplore={openClass}
          />
          <BrowseStream onExplore={(name) => showToast(`Opening ${name} stream`)} />
          <PopularSubjects onSelect={(name) => showToast(`Opening ${name} notes`)} />
          <FeaturedNotes
            onRead={(title) => showToast(`Opening: ${title}`)}
            onDownload={(title) => showToast(`Downloading PDF: ${title}`)}
          />
          <WhyStudyNotes />
          <HowItWorks />
          <Statistics />
          <ExamCTA />
          <Testimonials />
          <FAQ />
          <Newsletter
            onSubscribe={() =>
              showToast('Thank you for subscribing! You will receive updates about new study materials.')
            }
          />
        </>
      )}
      {onSpecialPage ? null : <Footer onLinkClick={handleNavigate} />}
      {toast ? <div className="toast">{toast}</div> : null}
    </>
  );
}
