const ContactUs = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface relative overflow-hidden">
      {/* Hidden decorative background details */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full border-[40px] border-[#F57C00]/5"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full border-[30px] border-[#000666]/5"></div>
        <div className="absolute -bottom-48 right-1/4 w-[400px] h-[400px] rounded-full border-[20px] border-[#F57C00]/5"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-8 tracking-tight text-center">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/30">
            <h2 className="text-xl font-bold text-primary mb-6">Get in Touch</h2>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none" placeholder="How can we help?" />
              </div>
              <button type="button" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-[#1a237e] transition-colors shadow-md">
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-primary-fixed/20 p-8 rounded-3xl">
              <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">location_on</span> Office
              </h3>
              <p className="text-base text-on-surface-variant">123 Impact Avenue, Suite 400<br/>Tech Park, Innovation City 400001</p>
            </div>
            
            <div className="bg-secondary-fixed/20 p-8 rounded-3xl">
              <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">mail</span> Email
              </h3>
              <p className="text-base text-on-surface-variant">support@shareat.org<br/>partnerships@shareat.org</p>
            </div>
            
            <div className="bg-tertiary-fixed/20 p-8 rounded-3xl">
              <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">phone</span> Phone
              </h3>
              <p className="text-base text-on-surface-variant">+91 1800-SHARE-JOY<br/>Mon-Fri, 9am - 6pm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
