
const PrivacyPolicy = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface relative overflow-hidden">
      {/* Hidden decorative background details */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full border-[40px] border-[#F57C00]/5"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full border-[30px] border-[#000666]/5"></div>
        <div className="absolute -bottom-48 right-1/4 w-[400px] h-[400px] rounded-full border-[20px] border-[#F57C00]/5"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-8 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-on-surface-variant mb-12">Last Updated: May 2026</p>
        
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-outline-variant/30 space-y-8 text-on-surface-variant">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed">
              When you register as a donor or an NGO on Shareat, we collect basic personal and organizational information. This includes your name, email address, physical address (for donation pickups), and contact number. We do not store sensitive payment information directly on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">2. How We Use Your Information</h2>
            <p className="leading-relaxed">
              We use your information exclusively to facilitate the donation process. Your pickup address and phone number are shared securely with our logistics partners and the assigned NGO solely for the purpose of completing the donation transfer. We do not sell or rent your personal data to third-party marketers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">3. Data Security</h2>
            <p className="leading-relaxed">
              We implement industry-standard encryption (such as bcrypt for passwords and JWT for session management) to protect your data. However, no electronic transmission over the internet is 100% secure.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
