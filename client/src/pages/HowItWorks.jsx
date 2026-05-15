import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface relative overflow-hidden">
      {/* Hidden decorative background details */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full border-[40px] border-[#F57C00]/5"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full border-[30px] border-[#000666]/5"></div>
        <div className="absolute -bottom-48 right-1/4 w-[400px] h-[400px] rounded-full border-[20px] border-[#F57C00]/5"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-6 tracking-tight">How Shareat Works</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            A seamless journey from your doorstep to someone in need. Discover how we make donating effortless and impactful.
          </p>
        </div>

        <div className="space-y-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 flex-shrink-0 bg-primary-fixed rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary mb-3">1. List Your Items</h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Log in to your Donor Dashboard and catalog the items you wish to donate. Whether it's lightly used clothes, books, or electronics, our platform categorizes them to find the perfect NGO match.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 flex-shrink-0 bg-secondary-fixed rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary mb-3">2. Schedule Doorstep Pickup</h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Choose a date and time that works for you. Our trusted logistics partners will arrive at your location, securely package the items, and transport them to the verified NGO.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 flex-shrink-0 bg-tertiary-fixed rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary mb-3">3. Make an Impact</h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Track your donation's journey in real-time. Once delivered, you'll receive a confirmation and can see exactly how many families your generosity has supported.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-primary hover:bg-[#1a237e] transition-all shadow-md hover:-translate-y-1">
            Start Donating Today
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
