import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const [showAppleMock, setShowAppleMock] = useState(false);
  const [mockEmail, setMockEmail] = useState('');
  const [appleEmail, setAppleEmail] = useState('');
  const navigate = useNavigate();

  const handleMockSubmit = async (e) => {
    e.preventDefault();
    if (!mockEmail || !mockEmail.includes('@')) {
      return setError('Please enter a valid Gmail address.');
    }
    setShowGoogleMock(false);

    try {
      const res = await axios.post('/api/auth/google-demo', { 
        email: mockEmail,
        role: 'donor' // Default role
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      navigate(`/${res.data.user.role}-dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Simulated Google login failed.');
    }
  };

  const handleAppleSubmit = async (e) => {
    e.preventDefault();
    if (!appleEmail || !appleEmail.includes('@')) {
      return setError('Please enter a valid Apple ID.');
    }
    setShowAppleMock(false);

    try {
      const res = await axios.post('/api/auth/apple-demo', { 
        email: appleEmail,
        role: 'donor' // Default role
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      navigate(`/${res.data.user.role}-dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Simulated Apple login failed.');
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      navigate(`/${res.data.user.role}-dashboard`);
    } catch (err) {
      if (!err.response) {
        setError('Server is offline or database is not connected. Please ensure MongoDB is running and "node index.js" is active.');
      } else if (err.response?.data?.requiresVerification) {
        // Redirect to verify email page
        navigate('/verify-email', { state: { email: err.response.data.email } });
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <main className="relative min-h-screen flex w-full bg-background">
      {/* Left Side: Image / Ethos Container (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen bg-black overflow-hidden flex-col justify-end p-[60px]">
        {/* Background Image */}
        <img 
          alt="Community gathering" 
          className="absolute inset-0 w-full h-full object-cover object-center block scale-105" 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80&auto=format&fit=crop"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Brand Message */}
        <div className="relative z-10 max-w-[440px] text-white pb-6">
          <h2 className="font-h1 text-[44px] leading-[1.1] font-bold tracking-tight mb-[16px] text-white drop-shadow-lg">
            Join the movement of sharing joy.
          </h2>
          <p className="font-body-lg text-[17px] leading-[1.6] text-white/90 drop-shadow-md font-medium">
            Cultivate community spirit by connecting over shared meals. Experience the warmth of giving and receiving.
          </p>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-background">
        {/* Subtle Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '600px' }}>all_inclusive</span>
        </div>

        <div className="flex flex-col p-[16px] sm:p-[24px] items-center relative z-10 w-full max-w-[600px] mx-auto py-20 min-h-screen">
          {/* Back Link & Logo Area */}
          <div className="w-full mb-[24px] flex justify-between items-center">
            <Link className="inline-flex items-center text-primary hover:text-secondary-container transition-colors duration-200 font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em]" to="/">
              <span className="material-symbols-outlined mr-[4px] text-[18px]">arrow_back</span>
              Back to Home
            </Link>
            <div className="font-h2 text-[28px] leading-[1.25] font-bold text-primary">Shareat</div>
          </div>

          {/* Main Form Card */}
          <div className="w-full bg-surface-container-lowest rounded-xl p-[32px] md:p-[48px] shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-secondary-container">
            <div className="mb-[20px]">
              <h1 className="font-h2 text-[28px] leading-[1.25] font-semibold text-primary mb-[4px]">Welcome back</h1>
              <p className="font-body-md text-[15px] leading-[1.5] text-on-surface-variant">Please enter your details to sign in.</p>
            </div>

            {/* Tabs */}
            <div className="flex w-full mb-[24px] border-b border-outline-variant relative">
              <button className="flex-1 pb-[10px] font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em] text-primary border-b-2 border-secondary-container transition-all">Log In</button>
              <Link to="/register" className="flex-1 text-center pb-[10px] font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em] text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Sign Up</Link>
            </div>

            {/* Login Form */}
            <form className="flex flex-col gap-[16px]" onSubmit={handleLogin}>
              {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

              {/* Email Field */}
              <div className="flex flex-col gap-[4px]">
                <label className="font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] text-primary" htmlFor="email">Email or Phone</label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest text-on-surface font-body-md text-[15px] leading-[1.5] focus:border-secondary-container focus:ring-1 focus:ring-secondary-container outline-none transition-all placeholder:text-outline border-outline" 
                  placeholder="Enter your email" 
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-[4px]">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] text-primary" htmlFor="password">Password</label>
                  <a className="font-caption text-[12px] leading-[1.4] text-secondary-container hover:text-secondary transition-colors font-medium" href="#" onClick={(e) => { e.preventDefault(); alert('Password reset functionality is coming soon! Please contact support for assistance.'); }}>Forgot Password?</a>
                </div>
                <div className="relative">
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest text-on-surface font-body-md text-[15px] leading-[1.5] focus:border-secondary-container focus:ring-1 focus:ring-secondary-container outline-none transition-all placeholder:text-outline pr-[40px] border-outline" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility" : "visibility_off"}</span>
                  </button>
                </div>
              </div>

              {/* Primary Button */}
              <button 
                type="submit"
                className="w-full bg-secondary-container text-on-secondary-container font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em] py-[12px] rounded-lg hover:bg-secondary hover:text-white transition-colors duration-200 shadow-[0px_4px_10px_rgba(252,130,12,0.2)] mt-[8px]"
              >
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-[12px] my-[24px]">
              <div className="flex-grow h-[1px] bg-outline-variant opacity-50"></div>
              <span className="font-caption text-[12px] leading-[1.4] text-on-surface-variant">OR</span>
              <div className="flex-grow h-[1px] bg-outline-variant opacity-50"></div>
            </div>

            {/* Social Logins */}
            <div className="flex flex-col gap-[12px]">
              <button type="button" onClick={() => setShowGoogleMock(true)} className="flex items-center justify-center gap-[12px] w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em] py-[10px] rounded-lg hover:bg-surface-container-low transition-colors duration-200">
                {/* Simple Google SVG */}
                <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Continue with Google
              </button>
              <button type="button" onClick={() => setShowAppleMock(true)} className="flex items-center justify-center gap-[12px] w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em] py-[10px] rounded-lg hover:bg-surface-container-low transition-colors duration-200">
                {/* Simple Apple SVG */}
                <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.365 7.113c-.929.043-1.97.632-2.585 1.343-.538.618-.98 1.543-.807 2.441 1.042.062 2.008-.553 2.595-1.285.55-.688.948-1.637.797-2.5zM16.91 10.871c-1.42 0-2.458.948-3.328.948-.89 0-1.78-.887-3.04-.887-1.571 0-3.042.926-3.856 2.378-1.674 2.926-.43 7.234 1.196 9.589.797 1.154 1.737 2.45 3.003 2.45 1.214 0 1.68-.748 3.125-.748 1.42 0 1.867.748 3.14.748 1.31 0 2.115-1.168 2.91-2.348.92-1.343 1.298-2.64 1.298-2.705-.03-.016-2.544-.974-2.544-3.921 0-2.463 2.012-3.642 2.102-3.687-1.15-1.686-2.927-1.9-3.565-1.944z" fill="black"></path>
                </svg>
                Continue with Apple
              </button>
            </div>

            <div className="mt-[24px] text-center w-full">
              <p className="font-caption text-[11px] leading-[1.4] text-outline">
                By signing in, you agree to our <a className="underline hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a className="underline hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
              </p>
            </div>

          </div>
        </div>
      </div>
      {/* Google Mock Login Modal */}
      {showGoogleMock && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-[450px] p-10 shadow-2xl flex flex-col items-center animate-slide-up">
            <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2 className="text-[24px] font-medium mb-2 text-[#202124] tracking-tight">Sign in</h2>
            <p className="text-[#202124] mb-8 text-[16px]">Use your Google Account</p>
            <form onSubmit={handleMockSubmit} className="w-full flex flex-col gap-4">
              <input 
                type="email" 
                required 
                value={mockEmail}
                onChange={e => setMockEmail(e.target.value)}
                placeholder="Email or phone" 
                className="w-full px-4 py-[14px] border border-gray-300 rounded-md focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[16px] transition-all"
              />
              <div className="flex justify-between items-center mt-8">
                <button type="button" onClick={() => setShowGoogleMock(false)} className="text-[#1a73e8] font-medium hover:bg-blue-50 px-4 py-2 rounded-md transition-colors">Cancel</button>
                <button type="submit" className="bg-[#1a73e8] text-white px-6 py-2 rounded-md font-medium hover:bg-[#1557b0] transition-colors shadow-sm">Next</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apple Mock Login Modal */}
      {showAppleMock && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-10 shadow-2xl flex flex-col items-center animate-slide-up relative">
            <button type="button" onClick={() => setShowAppleMock(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            
            <svg className="w-12 h-12 mb-6 text-black" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.365 7.113c-.929.043-1.97.632-2.585 1.343-.538.618-.98 1.543-.807 2.441 1.042.062 2.008-.553 2.595-1.285.55-.688.948-1.637.797-2.5zM16.91 10.871c-1.42 0-2.458.948-3.328.948-.89 0-1.78-.887-3.04-.887-1.571 0-3.042.926-3.856 2.378-1.674 2.926-.43 7.234 1.196 9.589.797 1.154 1.737 2.45 3.003 2.45 1.214 0 1.68-.748 3.125-.748 1.42 0 1.867.748 3.14.748 1.31 0 2.115-1.168 2.91-2.348.92-1.343 1.298-2.64 1.298-2.705-.03-.016-2.544-.974-2.544-3.921 0-2.463 2.012-3.642 2.102-3.687-1.15-1.686-2.927-1.9-3.565-1.944z" fill="currentColor"/>
            </svg>
            <h2 className="text-[22px] font-semibold mb-2 text-black tracking-tight">Sign in with Apple</h2>
            <p className="text-gray-500 mb-8 text-[14px]">Sign in to Shareat using your Apple ID.</p>
            
            <form onSubmit={handleAppleSubmit} className="w-full flex flex-col gap-4">
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  value={appleEmail}
                  onChange={e => setAppleEmail(e.target.value)}
                  placeholder="Apple ID" 
                  className="w-full px-4 py-[14px] border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-[16px] transition-all pr-[48px]"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-transparent hover:bg-gray-100 rounded-full transition-colors text-black">
                   <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </form>

            <div className="mt-8 text-center w-full border-t border-gray-100 pt-6 flex flex-col gap-3">
              <a href="#" onClick={e => e.preventDefault()} className="text-[13px] text-blue-600 hover:underline">Create Yours</a>
              <a href="#" onClick={e => e.preventDefault()} className="text-[13px] text-blue-600 hover:underline">Forgot Apple ID or Password?</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Login;
