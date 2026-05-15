import React from 'react';

const TermsOfService = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface relative overflow-hidden">
      {/* Hidden decorative background details */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full border-[40px] border-[#F57C00]/5"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full border-[30px] border-[#000666]/5"></div>
        <div className="absolute -bottom-48 right-1/4 w-[400px] h-[400px] rounded-full border-[20px] border-[#F57C00]/5"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-8 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-on-surface-variant mb-12">Last Updated: May 2026</p>
        
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-outline-variant/30 space-y-8 text-on-surface-variant">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using the Shareat portal, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">2. Donor Responsibilities</h2>
            <p className="leading-relaxed">
              As a donor, you agree to only list items that are in acceptable, usable condition. Listing hazardous, illegal, or heavily soiled items is strictly prohibited. Shareat reserves the right to suspend accounts that repeatedly violate quality guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">3. NGO Responsibilities</h2>
            <p className="leading-relaxed">
              Registered NGOs must maintain valid registration and compliance with local laws. NGOs agree to use the donated items strictly for charitable purposes and not for resale or commercial profit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">4. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Shareat acts solely as a platform connecting donors with NGOs. We are not liable for the condition of donated items, nor for any disputes arising between logistics partners, donors, and NGOs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
