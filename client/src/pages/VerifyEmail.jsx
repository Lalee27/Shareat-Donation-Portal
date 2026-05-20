import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state
  const email = location.state?.email || '';

  // If no email in state, redirect to register
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // On Backspace, move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      // Auto-submit
      setTimeout(() => handleVerify(pastedData), 300);
    }
  };

  const handleVerify = async (code) => {
    const verifyCode = code || otp.join('');
    if (verifyCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/verify-email', {
        email,
        code: verifyCode
      });

      setSuccess('Email verified successfully! Redirecting...');
      
      // Auto-login: save token and redirect to dashboard
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      
      setTimeout(() => {
        navigate(`/${res.data.user.role}-dashboard`);
      }, 1500);
    } catch (err) {
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/resend-otp', { email });
      setSuccess('New verification code sent to your email!');
      setCanResend(false);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  // Mask email for display
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : '';

  return (
    <main className="relative min-h-screen flex w-full bg-background">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen bg-black overflow-hidden flex-col justify-end p-[60px]">
        <img 
          alt="Community gathering" 
          className="absolute inset-0 w-full h-full object-cover object-center block scale-105" 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80&auto=format&fit=crop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="relative z-10 max-w-[440px] text-white pb-6">
          <h2 className="font-h1 text-[44px] leading-[1.1] font-bold tracking-tight mb-[16px] text-white drop-shadow-lg">
            Almost there!
          </h2>
          <p className="font-body-lg text-[17px] leading-[1.6] text-white/90 drop-shadow-md font-medium">
            Verify your email address to join the Shareat community and start making a real difference.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-background">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '600px' }}>mark_email_read</span>
        </div>

        <div className="flex flex-col p-[16px] sm:p-[24px] items-center relative z-10 w-full max-w-[600px] mx-auto py-20 min-h-screen justify-center">
          
          <div className="w-full mb-[24px] flex justify-between items-center">
            <Link className="inline-flex items-center text-primary hover:text-secondary-container transition-colors duration-200 font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em]" to="/register">
              <span className="material-symbols-outlined mr-[4px] text-[18px]">arrow_back</span>
              Back to Register
            </Link>
            <div className="font-h2 text-[28px] leading-[1.25] font-bold text-primary">Shareat</div>
          </div>

          <div className="w-full bg-surface-container-lowest rounded-xl p-[32px] md:p-[48px] shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-secondary-container">
            
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-secondary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary-container text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="font-h2 text-[28px] leading-[1.25] font-semibold text-primary mb-[8px]">Verify Your Email</h1>
              <p className="font-body-md text-[15px] leading-[1.5] text-on-surface-variant">
                We've sent a 6-digit verification code to
              </p>
              <p className="font-label-md text-[14px] font-semibold text-primary mt-1">{maskedEmail}</p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-[22px] font-bold rounded-lg border-2 outline-none transition-all duration-200
                    ${digit ? 'border-secondary-container bg-secondary-container/5 text-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface'}
                    focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 focus:scale-105
                  `}
                  disabled={loading || !!success}
                />
              ))}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200 mb-4 animate-fade-in">
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">error</span>
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-lg border border-green-200 mb-4 animate-fade-in">
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">check_circle</span>
                {success}
              </div>
            )}

            {/* Verify Button */}
            <button 
              onClick={() => handleVerify()}
              disabled={loading || otp.some(d => d === '') || !!success}
              className="w-full bg-secondary-container text-on-secondary-container font-label-md text-[14px] leading-[1.4] font-medium tracking-[0.01em] py-[12px] rounded-lg hover:bg-secondary hover:text-white transition-colors duration-200 shadow-[0px_4px_10px_rgba(252,130,12,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Verifying...
                </>
              ) : success ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  Verified!
                </>
              ) : (
                'Verify Email'
              )}
            </button>

            {/* Resend */}
            <div className="text-center mt-6">
              <p className="font-body-md text-[14px] text-on-surface-variant mb-2">Didn't receive the code?</p>
              {canResend ? (
                <button 
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-secondary-container hover:text-secondary font-label-md text-[14px] font-semibold transition-colors underline underline-offset-2 disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </button>
              ) : (
                <p className="text-on-surface-variant text-[13px]">
                  Resend code in <span className="font-semibold text-primary">{countdown}s</span>
                </p>
              )}
            </div>

            {/* Help text */}
            <div className="mt-6 p-3 bg-primary/5 rounded-lg">
              <p className="font-caption text-[11px] leading-[1.6] text-on-surface-variant text-center">
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                Check your spam/junk folder if you don't see the email. The code expires in 10 minutes.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyEmail;
