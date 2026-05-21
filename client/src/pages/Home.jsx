import { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Video - sharp, auto-playing */}
        <div className="absolute inset-0 z-0 bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-80"
            poster="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=90&auto=format&fit=crop"
          >
            <source src="/landing%20page%20video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
          <div className="max-w-2xl mt-8 md:mt-16">
            <h1 className="text-5xl sm:text-6xl lg:text-[76px] font-extrabold leading-[1.05] text-white mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tracking-tight">
              Share Joy,{' '}
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb786, #ffffff)', filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.5))' }}
              >
                Donate with Ease
              </span>
            </h1>

            <p className="text-lg sm:text-[22px] text-white/95 max-w-[620px] leading-relaxed mb-12 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Connect your unused clothes and household items with those who need them most.
              Experience the dignity of giving through our seamless platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full text-[17px] font-bold text-white bg-primary hover:bg-[#1a237e] transition-all duration-300 shadow-[0_8px_24px_rgba(0,6,102,0.5)] hover:shadow-[0_12px_30px_rgba(0,6,102,0.7)] hover:-translate-y-1"
              >
                Start Donating
                <span className="material-symbols-outlined transform group-hover:translate-x-1.5 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
              </Link>
              <button
                className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full text-[17px] font-bold text-primary bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                See How it Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 px-6 bg-white relative scroll-mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#000666' }}>About Shareat</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Shareat is a digital bridge connecting generous donors with verified NGOs. Our mission is to make the act of giving as seamless and dignified as possible.
            </p>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              By leveraging technology and trusted logistics partners, we ensure that your unused household items reach those who need them most, creating a cycle of kindness and sustainability.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">100%</span>
                <span className="text-sm text-on-surface-variant">Transparency</span>
              </div>
              <div className="w-px h-12 bg-outline-variant/30"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">Verified</span>
                <span className="text-sm text-on-surface-variant">NGO Partners</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop" 
                alt="Community impact"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-secondary-fixed rounded-3xl -z-10 -rotate-6"></div>
          </div>
        </div>
      </section>

      {/* NGO Trust Badges */}
      <section id="ngos" className="py-12 bg-white border-y border-primary-fixed/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-[0.2em] mb-6">Trusted by leading organizations</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-90 transition-all duration-500">
            {['Goonj', 'Smile Foundation', 'Oxfam India', 'CRY', 'Helpage India'].map((name) => (
              <div key={name} className="text-xl font-bold" style={{ color: '#1a237e' }}>{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* For NGOs Section */}
      <section className="py-24 px-6 bg-surface-container-low relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#000666' }}>For NGOs</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Empowering NGOs with a steady stream of verified donations, transparent tracking, and logistics support.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">verified</span>
                <span className="text-on-surface-variant font-medium">Verified donor network</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <span className="text-on-surface-variant font-medium">Doorstep pickup and delivery</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">dashboard</span>
                <span className="text-on-surface-variant font-medium">Digital inventory management</span>
              </li>
            </ul>
            <div className="pt-4">
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-primary hover:shadow-lg transition-all">
                Register as NGO Partner
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-primary-fixed/20">
              <div className="aspect-video rounded-2xl overflow-hidden mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?w=800&auto=format&fit=crop" 
                  alt="NGO Support"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-between items-center px-2">
                <div>
                  <div className="text-2xl font-bold text-primary">85+</div>
                  <div className="text-sm text-on-surface-variant">Active Partners</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">12k+</div>
                  <div className="text-sm text-on-surface-variant">Donations Received</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-surface-container-lowest relative scroll-mt-20">
        <div className="absolute inset-0 pattern-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold" style={{ color: '#000666' }}>How it Works</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Three simple steps to make a difference in someone's life today.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[35%] left-[16%] right-[16%] h-0.5 z-0" style={{ background: 'linear-gradient(90deg, #e0e0ff, #ffdcc6, #e0e0ff)' }}></div>

            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-10 shadow-[0px_10px_40px_rgba(26,35,126,0.06)] border border-primary-fixed/30 flex flex-col items-center text-center space-y-5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative z-10 group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'linear-gradient(90deg, #000666, #e0e0ff)' }}></div>
              <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition-transform duration-300 rotate-3">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1", color: '#000666' }}>inventory_2</span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: '#000666' }}>1. List Items</h3>
              <p className="text-on-surface-variant leading-relaxed">Easily catalog clothes, books, and household goods you wish to donate through our simple interface.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-10 shadow-[0px_10px_40px_rgba(26,35,126,0.06)] border border-secondary-fixed/50 flex flex-col items-center text-center space-y-5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative z-10 group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'linear-gradient(90deg, #964900, #ffdcc6)' }}></div>
              <div className="w-20 h-20 rounded-2xl bg-secondary-fixed flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition-transform duration-300 -rotate-3">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1", color: '#964900' }}>local_shipping</span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: '#000666' }}>2. Schedule Doorstep Pickup</h3>
              <p className="text-on-surface-variant leading-relaxed">Choose a convenient time, and our trusted logistics partners will securely collect items from your home.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-10 shadow-[0px_10px_40px_rgba(26,35,126,0.06)] border border-primary-fixed/30 flex flex-col items-center text-center space-y-5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative z-10 group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'linear-gradient(90deg, #000666, #e0e0ff)' }}></div>
              <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition-transform duration-300 rotate-3">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1", color: '#000666' }}>volunteer_activism</span>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: '#000666' }}>3. Make an Impact</h3>
              <p className="text-on-surface-variant leading-relaxed">Track your donation journey transparently and see the families and NGOs you've positively impacted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Counter */}
      <section id="impact" className="py-24 px-6 bg-surface-container relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 mandala-bg opacity-100"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="rounded-[2.5rem] p-12 md:p-16 shadow-[0px_20px_60px_rgba(26,35,126,0.2)] border border-primary-fixed/20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #000666, #1a237e)' }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ background: 'rgba(150, 73, 0, 0.15)' }}></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" style={{ background: 'rgba(224, 224, 255, 0.1)' }}></div>

            <h2 className="text-4xl font-bold text-center mb-16 text-white tracking-tight">Our Collective Impact</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center relative z-10">
              {[
                { icon: 'card_giftcard', num: '12,450+', label: 'Donations Made' },
                { icon: 'handshake', num: '85', label: 'NGOs Connected' },
                { icon: 'family_home', num: '5,200+', label: 'Families Helped' },
              ].map((stat) => (
                <div key={stat.label} className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1", color: '#ffdcc6' }}>{stat.icon}</span>
                  </div>
                  <div className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-3" style={{ color: '#ffdcc6' }}>{stat.num}</div>
                  <div className="text-sm uppercase tracking-widest font-semibold" style={{ color: '#bdc2ff' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-surface-container-lowest relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: '#000666' }}>
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            Join thousands of donors and NGOs working together to create a more equitable world. 
            Your unused items can change someone's life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-lg font-semibold text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #964900, #BF360C)' }}
            >
              Join as Donor
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-lg font-semibold border-2 hover:-translate-y-1 transition-all duration-300"
              style={{ color: '#000666', borderColor: '#000666' }}
            >
              Register as NGO
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,6,102,0.4)] hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <span className="material-symbols-outlined text-3xl">smart_toy</span>
        <span className="absolute right-full mr-4 bg-white text-primary text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat with AI Support
        </span>
      </button>

      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default Home;
