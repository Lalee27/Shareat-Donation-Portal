import { Link } from 'react-router-dom';

const Careers = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface relative overflow-hidden">
      {/* Hidden decorative background details */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full border-[40px] border-[#F57C00]/5"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full border-[30px] border-[#000666]/5"></div>
        <div className="absolute -bottom-48 right-1/4 w-[400px] h-[400px] rounded-full border-[20px] border-[#F57C00]/5"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-4 tracking-tight">Careers at Shareat</h1>
          <p className="text-base text-on-surface-variant">
            Build technology that builds a better world. Join our mission to eliminate waste and end scarcity.
          </p>
        </div>

        <div className="w-full bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-outline-variant/30 text-center mb-12">
          <div className="w-16 h-16 bg-surface-container-low mx-auto rounded-full flex items-center justify-center mb-6 border border-primary-fixed/20">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>work</span>
          </div>
          <h2 className="text-xl font-bold text-primary mb-4">No open positions right now</h2>
          <p className="text-base text-on-surface-variant mb-8 leading-relaxed">
            We are currently fully staffed, but we are always looking for passionate people who want to make a difference.
          </p>
          <Link to="/apply" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-base font-bold text-primary border-2 border-primary hover:bg-primary-fixed/20 transition-all duration-200">
            <span className="material-symbols-outlined text-[20px]">mail</span>
            Send Open Application
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-on-surface-variant">Are you an NGO? <Link to="/for-ngos" className="text-secondary font-bold hover:underline">Partner with us instead.</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Careers;
