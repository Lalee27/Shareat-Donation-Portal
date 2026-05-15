import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',
    organizationName: '',
    registrationNumber: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      if (!err.response) {
        setError('Server is offline or database is not connected. Please ensure MongoDB is running and "node index.js" is active.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
              <h1 className="font-h2 text-[28px] leading-[1.25] font-semibold text-primary mb-[4px]">Create Account</h1>
              <p className="font-body-md text-[15px] leading-[1.5] text-on-surface-variant">Fill in your details to get started.</p>
            </div>

            {/* Tabs */}
            <div className="flex w-full mb-[24px] border-b border-outline-variant relative">
              <Link to="/login" className="flex-1 text-center pb-[10px] font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em] text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Log In</Link>
              <button className="flex-1 pb-[10px] font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em] text-primary border-b-2 border-secondary-container transition-all">Sign Up</button>
            </div>

            {/* Registration Form */}
            <form className="flex flex-col gap-[16px]" onSubmit={handleRegister}>
              {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

              {/* Name & Phone Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div className="flex flex-col gap-[4px]">
                  <label className="font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] text-primary" htmlFor="name">Full Name</label>
                  <input 
                    id="name" name="name" type="text" required
                    value={formData.name} onChange={handleChange}
                    className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest text-on-surface font-body-md text-[15px] leading-[1.5] focus:border-secondary-container focus:ring-1 focus:ring-secondary-container outline-none transition-all placeholder:text-outline border-outline" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <label className="font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] text-primary" htmlFor="phone">Phone Number</label>
                  <input 
                    id="phone" name="phone" type="tel" required
                    value={formData.phone} onChange={handleChange}
                    className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest text-on-surface font-body-md text-[15px] leading-[1.5] focus:border-secondary-container focus:ring-1 focus:ring-secondary-container outline-none transition-all placeholder:text-outline border-outline" 
                    placeholder="+91 9876543210" 
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-[4px]">
                <label className="font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] text-primary" htmlFor="email">Email address</label>
                <input 
                  id="email" name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest text-on-surface font-body-md text-[15px] leading-[1.5] focus:border-secondary-container focus:ring-1 focus:ring-secondary-container outline-none transition-all placeholder:text-outline border-outline" 
                  placeholder="Enter your email" 
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-[4px]">
                <label className="font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] text-primary" htmlFor="password">Password</label>
                <div className="relative">
                  <input 
                    id="password" name="password" type={showPassword ? "text" : "password"} required
                    value={formData.password} onChange={handleChange}
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

              {/* Role Selection */}
              <div className="flex flex-col gap-[4px] pt-1">
                <label className="font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] text-primary mb-1">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center text-center transition-all ${formData.role === 'donor' ? 'border-secondary-container bg-secondary-container/10' : 'border-outline hover:border-secondary-container/50'}`}>
                    <input type="radio" name="role" value="donor" className="sr-only" checked={formData.role === 'donor'} onChange={handleChange} />
                    <span className={`material-symbols-outlined mb-1 text-[20px] ${formData.role === 'donor' ? 'text-secondary-container' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>card_giftcard</span>
                    <span className={`font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] ${formData.role === 'donor' ? 'text-secondary-container font-bold' : 'text-on-surface-variant'}`}>Donate Items</span>
                  </label>
                  <label className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center text-center transition-all ${formData.role === 'ngo' ? 'border-secondary-container bg-secondary-container/10' : 'border-outline hover:border-secondary-container/50'}`}>
                    <input type="radio" name="role" value="ngo" className="sr-only" checked={formData.role === 'ngo'} onChange={handleChange} />
                    <span className={`material-symbols-outlined mb-1 text-[20px] ${formData.role === 'ngo' ? 'text-secondary-container' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>foundation</span>
                    <span className={`font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] ${formData.role === 'ngo' ? 'text-secondary-container font-bold' : 'text-on-surface-variant'}`}>Register as NGO</span>
                  </label>
                </div>
              </div>

              {/* Conditionally rendered NGO fields */}
              {formData.role === 'ngo' && (
                <div className="flex flex-col gap-[16px] pt-1 animate-fade-in">
                  <div className="flex flex-col gap-[4px]">
                    <label className="font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] text-primary">Organization Name</label>
                    <input
                      name="organizationName" type="text" required={formData.role === 'ngo'}
                      className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest text-on-surface font-body-md text-[15px] leading-[1.5] focus:border-secondary-container focus:ring-1 focus:ring-secondary-container outline-none transition-all placeholder:text-outline border-outline"
                      placeholder="Hope Foundation" value={formData.organizationName} onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-[4px] mb-4">
                    <label className="font-label-md text-[13px] leading-[1.4] font-medium tracking-[0.01em] text-primary">Registration ID / License No.</label>
                    <input
                      name="registrationNumber" type="text" required={formData.role === 'ngo'}
                      className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest text-on-surface font-body-md text-[15px] leading-[1.5] focus:border-secondary-container focus:ring-1 focus:ring-secondary-container outline-none transition-all placeholder:text-outline border-outline"
                      placeholder="REG-1234567" value={formData.registrationNumber} onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* Primary Button */}
              <button 
                type="submit"
                className="w-full bg-secondary-container text-on-secondary-container font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em] py-[12px] rounded-lg hover:bg-secondary hover:text-white transition-colors duration-200 shadow-[0px_4px_10px_rgba(252,130,12,0.2)] mt-[8px]"
              >
                Create Account
              </button>
            </form>

            <div className="mt-[24px] text-center w-full">
              <p className="font-caption text-[11px] leading-[1.4] text-outline">
                By registering, you agree to our <a className="underline hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a className="underline hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
