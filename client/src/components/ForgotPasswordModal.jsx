import { useState } from 'react';
import axios from 'axios';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/reset-password', { email, code, newPassword });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-[450px] p-8 shadow-2xl flex flex-col relative animate-slide-up">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <h2 className="text-[24px] font-semibold text-primary mb-2">
          {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter Code' : 'Password Reset'}
        </h2>
        
        <p className="text-on-surface-variant text-[15px] mb-6">
          {step === 1 && "Enter your email address to receive a password reset code."}
          {step === 2 && "Enter the 6-digit code sent to your email along with your new password."}
          {step === 3 && "Your password has been successfully reset!"}
        </p>

        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200 mb-4">{error}</div>}
        {message && step !== 3 && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200 mb-4">{message}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-[4px]">
              <label className="font-label-md text-[13px] font-medium text-primary">Email address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest focus:border-secondary-container focus:ring-1 focus:ring-secondary-container outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !email}
              className="mt-2 w-full bg-secondary-container text-on-secondary-container font-bold py-[12px] rounded-lg hover:bg-secondary hover:text-white transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-[4px]">
              <label className="font-label-md text-[13px] font-medium text-primary">Reset Code</label>
              <input 
                type="text" 
                required 
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="6-digit code" 
                className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest focus:border-secondary-container outline-none tracking-widest text-center text-lg"
              />
            </div>

            <div className="flex flex-col gap-[4px]">
              <label className="font-label-md text-[13px] font-medium text-primary">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password" 
                  className="w-full px-[12px] py-[10px] rounded-lg border bg-surface-container-lowest focus:border-secondary-container outline-none pr-[40px]"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-outline-variant"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility" : "visibility_off"}</span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !code || !newPassword}
              className="mt-2 w-full bg-secondary-container text-on-secondary-container font-bold py-[12px] rounded-lg hover:bg-secondary hover:text-white transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <button 
              onClick={onClose} 
              className="w-full bg-secondary-container text-on-secondary-container font-bold py-[12px] rounded-lg hover:bg-secondary hover:text-white transition-all shadow-md"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
