import React from 'react';
import { Link } from 'react-router-dom';

const ForNGOs = () => {
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-6 tracking-tight">Partner With Shareat</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Empowering NGOs with a steady stream of verified donations, transparent tracking, and logistics support.
          </p>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-sm border border-outline-variant/30 mb-12">
          <h2 className="text-xl font-bold text-primary mb-6">Why Join Our Network?</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">Verified Donors</h3>
                <p className="text-base text-on-surface-variant">We ensure all donations are high-quality and directly meet the needs you specify on your dashboard.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">Seamless Logistics</h3>
                <p className="text-base text-on-surface-variant">You don't need to worry about pickup. Our logistics partners deliver the donations directly to your center.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">Inventory Management</h3>
                <p className="text-base text-on-surface-variant">Use our free digital dashboard to track incoming items, manage stock, and request specific goods.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-primary mb-6">Ready to scale your impact?</h2>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-secondary hover:bg-[#BF360C] transition-all shadow-md hover:-translate-y-1">
            Register as an NGO
            <span className="material-symbols-outlined">how_to_reg</span>
          </Link>
          <div className="mt-8">
            <p className="text-on-surface-variant mb-2">Already have an NGO account?</p>
            <Link to="/ngo-login" className="text-secondary font-bold hover:underline inline-flex items-center gap-1">
              Login as NGO Partner
              <span className="material-symbols-outlined text-[18px]">login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForNGOs;
