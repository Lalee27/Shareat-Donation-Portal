import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const OpenApplication = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/careers');
    }, 3000);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full border-[40px] border-[#F57C00]/5"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full border-[30px] border-[#000666]/5"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-6 relative z-10">
        <div className="mb-8">
          <Link to="/careers" className="inline-flex items-center text-primary hover:underline gap-2 text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Careers
          </Link>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-outline-variant/30">
          {!submitted ? (
            <>
              <h1 className="text-3xl font-extrabold text-primary mb-2 tracking-tight">Open Application</h1>
              <p className="text-base text-on-surface-variant mb-8">
                Tell us about yourself and why you'd like to join Shareat. We're always looking for talent.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">Full Name</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">Email Address</label>
                    <input 
                      type="email" required
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">Desired Role / Area of Interest</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                    placeholder="e.g. Full Stack Developer, UI Designer" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">LinkedIn Profile (Optional)</label>
                  <input 
                    type="url"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                    placeholder="https://linkedin.com/in/username" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">Why Shareat?</label>
                  <textarea 
                    rows="4" required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                    placeholder="Tell us what motivates you..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">Resume / Portfolio Link</label>
                  <input 
                    type="url" required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                    placeholder="Link to your Google Drive, Dropbox, or Portfolio" 
                  />
                </div>

                <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-[#1a237e] transition-all shadow-md hover:shadow-lg">
                  Submit Application
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">Application Received!</h2>
              <p className="text-base text-on-surface-variant mb-2">
                Thank you for your interest in Shareat. Our team will review your profile and get back to you if there's a fit.
              </p>
              <p className="text-sm text-on-surface-variant opacity-70">
                Redirecting you back to Careers...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenApplication;
