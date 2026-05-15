import React from 'react';

const AboutUs = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface relative overflow-hidden">
      {/* Hidden decorative background details */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full border-[40px] border-[#F57C00]/5"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full border-[30px] border-[#000666]/5"></div>
        <div className="absolute -bottom-48 right-1/4 w-[400px] h-[400px] rounded-full border-[20px] border-[#F57C00]/5"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-8 tracking-tight text-center">About Shareat</h1>
        
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-outline-variant/30">
          <h2 className="text-xl font-bold text-primary mb-4">Our Mission</h2>
          <p className="text-base text-on-surface-variant mb-8 leading-relaxed">
            Shareat was founded on a simple belief: excess in one home can be a lifeline in another. We aim to bridge the gap between people who want to give and organizations that desperately need resources, creating a circular economy of kindness.
          </p>

          <h2 className="text-xl font-bold text-primary mb-4">The Problem We Solve</h2>
          <p className="text-base text-on-surface-variant mb-8 leading-relaxed">
            Every year, millions of tons of usable clothes, books, and household items end up in landfills, while simultaneously, millions of underprivileged families lack basic necessities. The primary barrier isn't a lack of empathy—it's logistics and trust. Shareat removes these friction points.
          </p>

          <h2 className="text-xl font-bold text-primary mb-4">Our Core Values</h2>
          <ul className="list-disc pl-6 space-y-3 text-base text-on-surface-variant mb-8">
            <li><strong>Transparency:</strong> Every donation is tracked, ensuring it reaches its intended destination.</li>
            <li><strong>Dignity:</strong> We ensure that only high-quality, usable items are distributed.</li>
            <li><strong>Community:</strong> We believe in the power of localized giving and supporting local NGOs.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
