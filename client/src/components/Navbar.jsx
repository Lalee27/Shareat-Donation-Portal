import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getRole, removeToken } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getRole();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const path = location.pathname;
    const tabByPath = {
      '/': 'home',
      '/about': 'about',
      '/for-ngos': 'ngos',
      '/how-it-works': 'how-it-works',
      '/impact': 'impact',
    };
    const nextTab = tabByPath[path];
    if (nextTab) queueMicrotask(() => setActiveTab(nextTab));
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ScrollSpy Logic
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScrollSpy = () => {
      const sections = ['home', 'about', 'ngos', 'how-it-works', 'impact'];
      const scrollPosition = window.scrollY + 120; // Offset for fixed navbar

      // Check for home section (top of page)
      if (window.scrollY < 300) {
        setActiveTab('home');
        return;
      }

      for (const section of sections) {
        if (section === 'home') continue;
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    // Initial call to set correct tab on load
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [location.pathname]);

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };




  const getLinkStyles = (tabName) => {
    const base = "px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200";
    const active = "bg-[#000666] text-white shadow-sm";
    const inactive = "text-on-surface-variant hover:text-primary hover:bg-primary-fixed/30";
    return `${base} ${activeTab === tabName ? active : inactive}`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-primary-fixed/20'
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="flex justify-between items-center px-6 py-2.5 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span
            className="material-symbols-outlined text-3xl transition-transform group-hover:scale-110"
            style={{ color: '#964900', fontVariationSettings: "'FILL' 1" }}
          >
            volunteer_activism
          </span>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: '#000666' }}>
            Shareat
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-surface-container-low px-4 py-1.5 rounded-full border border-primary-fixed/30 shadow-sm">
          <Link
            to="/"
            onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={getLinkStyles('home')}
          >
            Home
          </Link>
          <Link
            to="/"
            onClick={(e) => { setActiveTab('about'); scrollToSection(e, 'about'); }}
            className={getLinkStyles('about')}
          >
            About
          </Link>
          <Link
            to="/"
            onClick={(e) => { setActiveTab('ngos'); scrollToSection(e, 'ngos'); }}
            className={getLinkStyles('ngos')}
          >
            NGOs
          </Link>
          <Link
            to="/"
            onClick={(e) => { setActiveTab('how-it-works'); scrollToSection(e, 'how-it-works'); }}
            className={getLinkStyles('how-it-works')}
          >
            How it Works
          </Link>
          <Link
            to="/"
            onClick={(e) => { setActiveTab('impact'); scrollToSection(e, 'impact'); }}
            className={getLinkStyles('impact')}
          >
            Impact
          </Link>
          {userRole && (
            <Link
              to={`/${userRole}-dashboard`}
              className="px-4 py-1.5 rounded-full text-sm font-bold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/60 transition-all duration-200"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {!userRole ? (
            <>
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-semibold rounded-full border border-primary text-primary hover:bg-primary-fixed/20 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 text-sm font-semibold rounded-full text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #964900, #BF360C)' }}
              >
                Get Started
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-5 py-2 text-sm font-semibold rounded-full border border-primary text-primary hover:bg-primary-fixed/20 transition-all duration-200"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-primary-fixed/20 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="material-symbols-outlined text-primary">
            {menuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-primary-fixed/20 px-6 py-4 flex flex-col gap-3 shadow-xl">
          <Link
            to="/"
            onClick={() => { setActiveTab('home'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`text-left py-2 text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Home
          </Link>
          <Link
            to="/"
            onClick={(e) => { setActiveTab('about'); scrollToSection(e, 'about'); }}
            className={`text-left py-2 text-sm font-medium transition-colors ${activeTab === 'about' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            About
          </Link>
          <Link
            to="/"
            onClick={(e) => { setActiveTab('ngos'); scrollToSection(e, 'ngos'); }}
            className={`text-left py-2 text-sm font-medium transition-colors ${activeTab === 'ngos' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            NGOs
          </Link>
          <Link
            to="/"
            onClick={(e) => { setActiveTab('how-it-works'); scrollToSection(e, 'how-it-works'); }}
            className={`text-left py-2 text-sm font-medium transition-colors ${activeTab === 'how-it-works' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            How it Works
          </Link>
          <Link
            to="/"
            onClick={(e) => { setActiveTab('impact'); scrollToSection(e, 'impact'); }}
            className={`text-left py-2 text-sm font-medium transition-colors ${activeTab === 'impact' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Impact
          </Link>
          {userRole && (
            <Link
              to={`/${userRole}-dashboard`}
              onClick={() => setMenuOpen(false)}
              className="py-2 text-sm font-bold text-primary"
            >
              Dashboard
            </Link>
          )}
          <hr className="border-primary-fixed/20" />
          {!userRole ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center py-2.5 text-sm font-semibold rounded-full border border-primary text-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="text-center py-2.5 text-sm font-semibold rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #964900, #BF360C)' }}
              >
                Get Started
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="text-center py-2.5 text-sm font-semibold rounded-full border border-primary text-primary"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
