import React from 'react';
import { Link } from 'react-router-dom';

const ImpactStories = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface relative overflow-hidden">
      {/* Hidden decorative background details */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full border-[40px] border-[#F57C00]/5"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full border-[30px] border-[#000666]/5"></div>
        <div className="absolute -bottom-48 right-1/4 w-[400px] h-[400px] rounded-full border-[20px] border-[#F57C00]/5"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-6 tracking-tight">Impact Stories</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Real stories of hope and transformation made possible by donors like you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-lg transition-shadow">
            <div className="h-64 bg-gray-200 relative">
               <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80" alt="Children smiling" className="w-full h-full object-cover" />
            </div>
            <div className="p-8">
              <span className="text-sm font-bold text-secondary uppercase tracking-wider mb-2 block">Education</span>
              <h2 className="text-xl font-bold text-primary mb-4">Books that Built a Future</h2>
              <p className="text-base text-on-surface-variant leading-relaxed mb-6">
                Thanks to over 5,000 donated books, a local community center in Dharavi was able to open its first free library, giving hundreds of children access to daily educational resources.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-lg transition-shadow">
            <div className="h-64 bg-gray-200 relative">
               <img src="https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800&q=80" alt="Winter clothes distribution" className="w-full h-full object-cover" />
            </div>
            <div className="p-8">
              <span className="text-sm font-bold text-secondary uppercase tracking-wider mb-2 block">Winter Drive</span>
              <h2 className="text-xl font-bold text-primary mb-4">Warmth for the Homeless</h2>
              <p className="text-base text-on-surface-variant leading-relaxed mb-6">
                Our winter clothes drive collected over 12,000 jackets and blankets. These were distributed across northern India, ensuring vulnerable families stayed warm during the harsh cold wave.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImpactStories;
