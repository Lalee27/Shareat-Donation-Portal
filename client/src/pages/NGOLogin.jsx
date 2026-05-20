import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const NGOLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      
      if (res.data.user.role !== 'ngo') {
        setError('This login is for NGO partners only. Please use the Donor Login page.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        return;
      }
      
      navigate('/ngo-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <main className="relative min-h-screen flex w-full bg-background">
      {/* Left Side: Image Container */}
      <div className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen bg-black overflow-hidden flex-col justify-end p-[60px]">
        <img 
          alt="NGO partnership" 
          className="absolute inset-0 w-full h-full object-cover object-center block opacity-90" 
          src="/login-bg.png"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="relative z-10 max-w-[440px] text-white pb-6">
          <h2 className="font-h1 text-[44px] leading-[1.1] font-bold tracking-tight mb-[16px]">
            Empowering communities together.
          </h2>
          <p className="font-body-lg text-[17px] leading-[1.6] text-white/90">
            Join our network of verified NGO partners and manage your donations seamlessly.
          </p>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-background">
        <div className="flex flex-col p-[24px] items-center relative z-10 w-full max-w-[600px] mx-auto py-20 min-h-screen">
          <div className="w-full mb-[24px] flex justify-between items-center">
            <Link className="inline-flex items-center text-primary hover:text-secondary-container transition-colors font-medium text-[14px]" to="/">
              <span className="material-symbols-outlined mr-[4px] text-[18px]">arrow_back</span>
              Back to Home
            </Link>
            <div className="font-h2 text-[28px] font-bold text-primary">Shareat</div>
          </div>

          <div className="w-full bg-surface-container-lowest rounded-xl p-[32px] md:p-[48px] shadow-lg border-t-4 border-secondary-container">
            <div className="mb-[20px]">
              <h1 className="font-h2 text-[28px] font-semibold text-primary mb-[4px]">NGO Partner Login</h1>
              <p className="font-body-md text-[15px] text-on-surface-variant">Sign in to access your dashboard.</p>
            </div>

            <form className="flex flex-col gap-[16px]" onSubmit={handleLogin}>
              {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

              <div className="flex flex-col gap-[4px]">
                <label className="font-label-md text-[13px] font-medium text-primary" htmlFor="email">Email address</label>
                <input 
                  id="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest focus:border-secondary-container outline-none transition-all" 
                  placeholder="ngo@example.org" 
                />
              </div>

              <div className="flex flex-col gap-[4px]">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-[13px] font-medium text-primary" htmlFor="password">Password</label>
                  <a className="text-[12px] text-secondary-container hover:underline" href="#" onClick={(e) => { e.preventDefault(); alert('Password reset functionality is coming soon!'); }}>Forgot Password?</a>
                </div>
                <div className="relative">
                  <input 
                    id="password" type={showPassword ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest focus:border-secondary-container outline-none pr-[40px]" 
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-outline-variant">
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility" : "visibility_off"}</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-secondary-container text-on-secondary-container font-bold py-[12px] rounded-lg hover:bg-secondary hover:text-white transition-all shadow-md mt-[8px]">
                Sign In as NGO
              </button>
            </form>

            <div className="mt-[24px] text-center w-full">
              <p className="font-caption text-[11px] text-outline">
                Not a partner yet? <Link to="/register" className="text-primary font-bold hover:underline">Register your NGO</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NGOLogin;
