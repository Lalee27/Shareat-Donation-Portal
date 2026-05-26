import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Eagerly load lightweight public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load heavy pages — only downloaded when user visits them
const DonorDashboard   = lazy(() => import('./pages/DonorDashboard'));
const NGODashboard     = lazy(() => import('./pages/NGODashboard'));
const AdminDashboard   = lazy(() => import('./pages/AdminDashboard'));
const HowItWorks       = lazy(() => import('./pages/HowItWorks'));
const ImpactStories    = lazy(() => import('./pages/ImpactStories'));
const ForNGOs          = lazy(() => import('./pages/ForNGOs'));
const AboutUs          = lazy(() => import('./pages/AboutUs'));
const ContactUs        = lazy(() => import('./pages/ContactUs'));
const Careers          = lazy(() => import('./pages/Careers'));
const PrivacyPolicy    = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService   = lazy(() => import('./pages/TermsOfService'));
const NGOLogin         = lazy(() => import('./pages/NGOLogin'));
const OpenApplication  = lazy(() => import('./pages/OpenApplication'));
const Settings         = lazy(() => import('./pages/Settings'));
const Notifications    = lazy(() => import('./pages/Notifications'));
const VerifyEmail      = lazy(() => import('./pages/VerifyEmail'));

// Minimal fallback shown while a lazy chunk is downloading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <span className="text-on-surface-variant text-sm font-medium">Loading…</span>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  
  // List of routes/substrings that should hide the public Navbar and Footer
  const hideHeaderFooter = [
    '-dashboard',
    '/login',
    '/ngo-login',
    '/register',
    '/verify-email',
    '/settings',
    '/notifications'
  ].some(route => location.pathname.includes(route) || location.pathname.startsWith(route));

  useEffect(() => {
    try {
      const isDark = localStorage.getItem('darkMode') === 'true';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      console.error('Failed to apply theme preference:', err);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" />
      {!hideHeaderFooter && <Navbar />}
      <main className="flex-grow">
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ngo-login" element={<NGOLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/donor-dashboard" element={<DonorDashboard />} />
            <Route path="/ngo-dashboard" element={<NGODashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/impact" element={<ImpactStories />} />
            <Route path="/for-ngos" element={<ForNGOs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/apply" element={<OpenApplication />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
