import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-container-highest dark:bg-surface-container full-width bottom border-t border-outline-variant/30 flat flex flex-col items-center pt-16 pb-8 px-6 w-full relative mt-auto">
      <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none"></div>
      <div className="max-w-7xl w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-12 relative z-10 mb-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
            <div className="font-h3 text-h3 font-bold text-primary">Shareat</div>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant max-w-xs">Empowering communities through seamless and dignified giving.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto font-caption text-sm text-on-surface">
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-primary mb-1">Platform</h4>
            <Link to="/how-it-works" className="text-on-surface-variant hover:text-secondary hover:underline decoration-secondary transition-all">How it Works</Link>
            <Link to="/impact" className="text-on-surface-variant hover:text-secondary hover:underline decoration-secondary transition-all">Impact Stories</Link>
            <Link to="/for-ngos" className="text-on-surface-variant hover:text-secondary hover:underline decoration-secondary transition-all">For NGOs</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-primary mb-1">Company</h4>
            <Link to="/about" className="text-on-surface-variant hover:text-secondary hover:underline decoration-secondary transition-all">About Us</Link>
            <Link to="/contact" className="text-on-surface-variant hover:text-secondary hover:underline decoration-secondary transition-all">Contact Us</Link>
            <Link to="/careers" className="text-on-surface-variant hover:text-secondary hover:underline decoration-secondary transition-all">Careers</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-primary mb-1">Legal</h4>
            <Link to="/privacy" className="text-on-surface-variant hover:text-secondary hover:underline decoration-secondary transition-all">Privacy Policy</Link>
            <Link to="/terms" className="text-on-surface-variant hover:text-secondary hover:underline decoration-secondary transition-all">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="w-full max-w-7xl border-t border-primary-fixed/20 pt-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-caption text-sm text-on-surface-variant text-center md:text-left">
          © {new Date().getFullYear()} Shareat. Building cultural continuity through giving.
        </div>
        <div className="flex gap-4">
          <button className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">share</span>
          </button>
          <Link to="/contact" className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">mail</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
