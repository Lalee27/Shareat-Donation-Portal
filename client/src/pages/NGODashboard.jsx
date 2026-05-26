import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken, removeToken } from '../utils/auth';

const API = '/api';

const statusColors = {
  pending:     'text-on-surface-variant',
  accepted:    'text-[#F57C00]',
  collected:   'text-[#F57C00]',
  distributed: 'text-primary',
  cancelled:   'text-red-500',
};

const categoryIcons = {
  clothes:     '👕',
  household:   '🏠',
  books:       '📚',
  electronics: '💻',
  toys:        '🧸',
  other:       '📦',
};

export default function NGODashboard() {
  const [tab, setTab]           = useState('overview');
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [stats, setStats]       = useState({ total:0, pending:0, accepted:0, collected:0, distributed:0, totalItems:0 });
  const [donations, setDonations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  const token = getToken();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (!token) { navigate('/login'); return; }
        const cfg = { headers: { Authorization: `Bearer ${token}` } };
        const [sRes, dRes, uRes, unreadRes] = await Promise.all([
          axios.get(`${API}/donations/stats`, cfg),
          axios.get(`${API}/donations`, cfg),
          axios.get(`${API}/auth/me`, cfg),
          axios.get(`${API}/notifications/unread-count`, cfg),
        ]);
        setStats(sRes.data);
        setDonations(dRes.data.donations);
        setUser(uRes.data);
        setUnreadNotifications(unreadRes.data.count);
      } catch (e) {
        if (e.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [navigate, token]);

  const updateStatus = async (id, status, note = '') => {
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`${API}/donations/${id}/status`, { status, note }, cfg);
      setDonations(prev => prev.map(d => d._id === id ? res.data : d));
      if (selected?._id === id) setSelected(res.data);
      const sRes = await axios.get(`${API}/donations/stats`, cfg);
      setStats(sRes.data);
      try {
        const unreadRes = await axios.get(`${API}/notifications/unread-count`, cfg);
        setUnreadNotifications(unreadRes.data.count);
      } catch (err) {
        console.error("Error updating unread count:", err);
      }
      toast.success(`Status updated to "${status}"`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const filtered = donations.filter(d => {
    const matchStatus = filter === 'all' || d.status === filter;
    const matchSearch = !search ||
      d.donor?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.pickupAddress?.city?.toLowerCase().includes(search.toLowerCase()) ||
      d.items?.some(i => i.category.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      const res = await axios.post(`${API}/auth/profile/avatar`, formData, cfg);
      setUser(res.data);
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the profile picture?')) return;
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.delete(`${API}/auth/profile/avatar`, cfg);
      setUser(res.data);
      toast.success('Profile picture deleted');
    } catch {
      toast.error('Failed to delete avatar');
    }
  };

  const exportToCSV = () => {
    if (filtered.length === 0) return toast.error('No data to export');
    const headers = ['Donor Name', 'City', 'Items', 'Status', 'Pickup Date', 'Time Slot'];
    const rows = filtered.map(d => [
      d.donor?.name || 'Unknown',
      d.pickupAddress?.city || 'Unknown',
      d.items.map(i => `${i.quantity} ${i.name || i.category}`).join('; '),
      d.status,
      new Date(d.pickupDate).toLocaleDateString(),
      d.pickupTimeSlot
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(field => `"${field}"`).join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "donations_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImpact = () => {
    const text = `We've collected ${stats.totalItems} items and reached ${stats.familiesReached || 0} families via Shareat! 🌍💚`;
    if (navigator.share) {
      navigator.share({ title: 'Our Impact on Shareat', text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Impact summary copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center font-h3 text-primary">Loading...</div>;
  }

  return (
    <div className="flex bg-background min-h-screen">
      
      {/* Web SideNavBar */}
      <nav className="hidden md:flex bg-surface-container-low dark:bg-surface-dim h-screen left-0 w-64 border-r border-outline-variant fixed top-0 z-40">
        <div className="flex flex-col h-full p-sm space-y-xs w-full">
          <div className="px-md py-lg">
            <div className="font-h3 text-h3 font-bold text-primary dark:text-primary-fixed">Shareat</div>
            <div className="font-caption text-caption text-on-surface-variant mt-1">Social Impact Platform</div>
          </div>
          <div className="flex-grow flex flex-col space-y-1">
            <button onClick={() => { setTab('overview'); setSelected(null); }} className={`${tab === 'overview' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">dashboard</span> Dashboard
            </button>
            <button onClick={() => { setTab('donations'); setSelected(null); }} className={`${tab === 'donations' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span> Available Requests
            </button>
            <button onClick={() => { setTab('profile'); setSelected(null); }} className={`${tab === 'profile' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">person</span> Profile
            </button>
          </div>
          <div className="mt-auto px-6 pb-6 space-y-2">
            <button onClick={handleLogout} className="w-full text-on-surface-variant hover:bg-surface-variant font-label-md text-label-md py-3 rounded-xl transition-colors duration-200 flex items-center justify-center">
              <span className="material-symbols-outlined mr-3 text-sm">logout</span>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-h-screen relative z-30 bg-background overflow-hidden md:ml-64">
        
        {/* Web TopAppBar */}
        <div className="hidden md:flex bg-white shadow-sm border-b border-outline-variant/30 justify-between items-center px-6 h-16 w-full sticky top-0 z-30">
          <div className="font-h3 text-h3 text-primary capitalize">{tab === 'overview' ? 'Dashboard' : tab === 'donations' ? 'Available Requests' : tab}</div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <span onClick={() => navigate('/notifications')} className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high rounded-full p-2 transition-all duration-200">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </div>
            <span onClick={() => navigate('/settings')} className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high rounded-full p-2 transition-all duration-200">settings</span>
            <img onClick={() => setTab('profile')} alt="User Avatar" className="w-8 h-8 rounded-full border border-outline-variant cursor-pointer hover:ring-2 hover:ring-primary transition-all" src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${user.avatar}`) : "https://lh3.googleusercontent.com/aida-public/AB6AXuCW00rc3lCQ27PL_Q9hQIUM5BNkD87m3NVcioH_4vRyY0zo-SKwVWh2xNJCYYFlXiMLCLHVNZnefGXDlGiX0G4_-8KaZFE7eFOkPNgYbfhYYaf7GD64Ll1Ispt94GEia8EClZhx8Ty_fIL0VMm5KXg5cp7tAId-TO_Q66jbXrzYEWoIookjFtjIkWr0AoP1rUVQlK6O41kXp7Rc1mc4noL2P_RVoxdLc8JVMxtldhKG_puYk5EGZxxplQLfZ1gqPTHn2PbD7Vg2xAU"} />
          </div>
        </div>

        {/* Mobile TopAppBar */}
        <div className="flex md:hidden bg-white shadow-sm border-b border-outline-variant/30 justify-between items-center px-4 h-16 w-full sticky top-0 z-40">
          <div className="font-h3 text-xl font-bold text-primary">Shareat</div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <span onClick={() => navigate('/notifications')} className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high rounded-full p-2 transition-all duration-200">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-secondary text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </div>
            <span onClick={() => navigate('/settings')} className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high rounded-full p-2 transition-all duration-200">settings</span>
            <img onClick={() => setTab('profile')} alt="User Avatar" className="w-8 h-8 rounded-full border border-outline-variant cursor-pointer hover:ring-2 hover:ring-primary transition-all" src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${user.avatar}`) : "https://lh3.googleusercontent.com/aida-public/AB6AXuCW00rc3lCQ27PL_Q9hQIUM5BNkD87m3NVcioH_4vRyY0zo-SKwVWh2xNJCYYFlXiMLCLHVNZnefGXDlGiX0G4_-8KaZFE7eFOkPNgYbfhYYaf7GD64Ll1Ispt94GEia8EClZhx8Ty_fIL0VMm5KXg5cp7tAId-TO_Q66jbXrzYEWoIookjFtjIkWr0AoP1rUVQlK6O41kXp7Rc1mc4noL2P_RVoxdLc8JVMxtldhKG_puYk5EGZxxplQLfZ1gqPTHn2PbD7Vg2xAU"} />
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-outline-variant/30 justify-around items-center py-2 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <button onClick={() => { setTab('overview'); setSelected(null); }} className={`flex flex-col items-center py-1 flex-1 ${tab === 'overview' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: tab === 'overview' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
            <span className="text-[10px] font-bold mt-0.5">Dashboard</span>
          </button>
          <button onClick={() => { setTab('donations'); setSelected(null); }} className={`flex flex-col items-center py-1 flex-1 ${tab === 'donations' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: tab === 'donations' ? "'FILL' 1" : "'FILL' 0" }}>inventory_2</span>
            <span className="text-[10px] font-bold mt-0.5">Requests</span>
          </button>
          <button onClick={() => { setTab('profile'); setSelected(null); }} className={`flex flex-col items-center py-1 flex-1 ${tab === 'profile' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: tab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
            <span className="text-[10px] font-bold mt-0.5">Profile</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center py-1 flex-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="text-[10px] font-bold mt-0.5">Logout</span>
          </button>
        </nav>

        {/* Decorative background circles matching design */}
        <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full border-[40px] border-[#F57C00]/5"></div>
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] rounded-full border-[30px] border-[#000666]/5"></div>
          <div className="absolute top-1/2 -right-24 w-[300px] h-[300px] rounded-full border-[20px] border-[#F57C00]/5"></div>
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border-[35px] border-[#000666]/5"></div>
          <div className="absolute bottom-1/3 -left-16 w-[250px] h-[250px] rounded-full border-[20px] border-[#F57C00]/5"></div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-8 max-w-container-max mx-auto w-full space-y-8 flex-grow pb-32 md:pb-24 relative z-10">
          {tab === 'overview' && (
            <div className="animate-fade-in space-y-xl">
              {/* Inventory Summary (Top Section) */}
              <section className="max-w-container-max mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="bg-surface rounded-xl p-md shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-secondary-container">
                    <div className="flex items-center gap-sm text-on-surface-variant mb-xs">
                      <span className="material-symbols-outlined">inventory</span>
                      <h3 className="font-label-md text-label-md">Items Received</h3>
                    </div>
                    <p className="font-h1 text-h1 text-primary">{stats.totalItems}</p>
                    <p className="font-caption text-caption text-secondary mt-xs">+12% this month</p>
                  </div>
                  <div className="bg-surface rounded-xl p-md shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-primary-container">
                    <div className="flex items-center gap-sm text-on-surface-variant mb-xs">
                      <span className="material-symbols-outlined">group</span>
                      <h3 className="font-label-md text-label-md">Families Reached</h3>
                    </div>
                    <p className="font-h1 text-h1 text-primary">{stats.familiesReached || 0}</p>
                    <p className="font-caption text-caption text-secondary mt-xs">+8% this month</p>
                  </div>
                  <div className="bg-surface rounded-xl p-md shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-emerald-500 flex items-center justify-between relative overflow-hidden">
                    <div className="z-10">
                      <h3 className="font-label-md text-label-md text-on-surface-variant mb-xs">Monthly Goal</h3>
                      <p className="font-h2 text-h2 text-primary">{Math.min((stats.totalItems / 1000 * 100), 100).toFixed(0)}%</p>
                      <p className="font-caption text-caption text-on-surface-variant mt-xs">Of 1,000 items</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-surface-variant flex items-center justify-center relative z-10">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-secondary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${Math.min(stats.totalItems / 1000 * 100, 100)}, 100`} strokeWidth="4"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </section>

              {/* Available Requests Grid */}
              <section className="max-w-container-max mx-auto">
                <div className="flex justify-between items-end mb-lg">
                  <div>
                    <h2 className="font-h2 text-h2 text-on-background mb-xs">Available Donations</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Review and accept items ready for pickup.</p>
                  </div>
                  <div className="flex gap-sm">
                    <button onClick={() => setTab('donations')} className="px-sm py-xs rounded-full border border-outline-variant font-caption text-caption text-on-surface-variant flex items-center gap-xs hover:bg-surface-variant">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span> View All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                  {donations.filter(d => d.status === 'pending').length === 0 ? (
                    <div className="col-span-full p-8 text-center text-on-surface-variant bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)]">No available donations right now.</div>
                  ) : (
                    donations.filter(d => d.status === 'pending').slice(0, 6).map((d) => {
                      const mainItem = d.items[0];
                      const categoryImages = {
                        household: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80',
                        clothes: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&q=80',
                        books: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
                        electronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&q=80',
                        toys: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80',
                        other: 'https://images.unsplash.com/photo-1584263347416-85a696b4eda7?w=400&q=80'
                      };
                      const imgUrl = categoryImages[mainItem?.category] || categoryImages.other;
                      
                      const locationStr = d.pickupAddress?.city ? `${d.pickupAddress.city}${d.pickupAddress?.state ? `, ${d.pickupAddress.state}` : ''}` : 'Local';

                      return (
                        <div key={d._id} onClick={() => setSelected(d)} className="cursor-pointer bg-surface rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(26,35,126,0.05)] hover:shadow-[0px_8px_30px_rgba(26,35,126,0.08)] transition-all duration-300 flex flex-col hover:-translate-y-1">
                          <div className="h-48 w-full relative">
                            <img alt={mainItem?.category || 'Donation'} className="w-full h-full object-cover" src={imgUrl} />
                            <div className="absolute top-sm right-sm bg-surface-container px-sm py-xs rounded-full font-caption text-caption font-medium text-on-surface shadow-sm">
                              {locationStr}
                            </div>
                          </div>
                          <div className="p-md flex-1 flex flex-col">
                            <div className="flex gap-xs mb-sm flex-wrap">
                              {d.items.slice(0,2).map((item, i) => (
                                <span key={i} className="bg-primary-container/10 text-primary px-sm py-xs rounded-full font-caption text-caption capitalize">
                                  {item.category}
                                </span>
                              ))}
                              {d.items.length > 2 && (
                                <span className="bg-surface-variant text-on-surface-variant px-sm py-xs rounded-full font-caption text-caption">+{d.items.length - 2} more</span>
                              )}
                            </div>
                            <h3 className="font-h3 text-h3 text-on-background mb-xs capitalize">{mainItem?.name || `${mainItem?.category} Donation`}</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant flex-1 line-clamp-2">
                              {d.items.map(i => `${i.quantity}x ${i.name || i.category}`).join(', ')}
                            </p>
                            <div className="mt-md pt-sm border-t border-outline-variant/30 flex justify-between items-center">
                              <div className="flex items-center gap-xs text-on-surface-variant">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                                <span className="font-caption text-caption">{new Date(d.pickupDate).toLocaleDateString()}</span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); updateStatus(d._id, 'accepted'); }} className="bg-secondary-container hover:bg-secondary text-on-primary px-md py-sm rounded-lg font-label-md font-bold transition-all duration-200">
                                Accept
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          )}
          
          {tab === 'donations' && (
            <div className="animate-fade-in space-y-8 max-w-container-max mx-auto">
              <section className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] overflow-hidden border border-outline-variant/30">
                  <div className="p-6 border-b border-outline-variant/30">
                    <h2 className="font-h3 text-h3 text-primary mb-4">All Requests</h2>
                    <div className="flex flex-col xl:flex-row gap-4 justify-between">
                      <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                          <input
                            type="text"
                            placeholder="Search donor, city, category..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-surface text-on-surface font-body-md"
                          />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar items-center">
                          {['all', 'pending', 'accepted', 'collected', 'distributed'].map(f => (
                            <button
                              key={f}
                              onClick={() => setFilter(f)}
                              className={`px-4 py-2 rounded-full font-label-md text-sm capitalize whitespace-nowrap transition-all shadow-sm border
                                ${filter === f ? 'bg-primary text-on-primary border-primary shadow-primary/20 scale-105' : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-variant'}`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={exportToCSV} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-surface-container-high hover:bg-primary-container text-primary hover:text-on-primary-container font-label-md rounded-xl transition-all border border-outline-variant whitespace-nowrap xl:w-auto shadow-sm active:scale-95">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export CSV
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant">
                          <th className="p-md font-medium border-b border-outline-variant/30">Donor</th>
                          <th className="p-md font-medium border-b border-outline-variant/30">Items</th>
                          <th className="p-md font-medium border-b border-outline-variant/30">Pickup Date</th>
                          <th className="p-md font-medium border-b border-outline-variant/30">Status</th>
                          <th className="p-md font-medium border-b border-outline-variant/30 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-body-md text-on-surface">
                        {filtered.length === 0 ? (
                          <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">No donations match your filters.</td></tr>
                        ) : (
                          filtered.map(d => (
                            <tr key={d._id} onClick={() => setSelected(d)} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/10 cursor-pointer">
                              <td className="p-md">
                                <div className="font-medium text-primary">{d.donor?.name || 'Unknown'}</div>
                                <div className="text-caption text-on-surface-variant">{d.pickupAddress?.city}</div>
                              </td>
                              <td className="p-md">
                                {d.items.map((i, idx) => (
                                  <span key={idx} className="bg-surface-variant text-on-surface-variant text-xs px-2 py-1 rounded-full mr-1 mb-1 inline-block">
                                    {categoryIcons[i.category]} {i.quantity}x {i.name || i.category}
                                  </span>
                                ))}
                              </td>
                              <td className="p-md">
                                <div>{new Date(d.pickupDate).toLocaleDateString()}</div>
                                <div className="text-caption text-on-surface-variant capitalize">{d.pickupTimeSlot}</div>
                              </td>
                              <td className="p-md">
                                <span className={`font-label-md text-label-md flex items-center capitalize ${statusColors[d.status] || ''}`}>
                                  {d.status === 'pending' && <span className="material-symbols-outlined text-sm mr-xs">schedule</span>}
                                  {d.status === 'accepted' && <span className="w-2 h-2 rounded-full bg-[#F57C00] mr-xs"></span>}
                                  {(d.status === 'collected' || d.status === 'distributed') && <span className="material-symbols-outlined text-sm mr-xs">check_circle</span>}
                                  {d.status}
                                </span>
                              </td>
                              <td className="p-md text-right" onClick={(e) => e.stopPropagation()}>
                                {d.status === 'pending' && (
                                  <button onClick={() => updateStatus(d._id, 'accepted')} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm text-sm">Accept</button>
                                )}
                                {d.status === 'accepted' && (
                                  <button onClick={() => updateStatus(d._id, 'collected')} className="bg-secondary text-white px-4 py-2 rounded-lg font-label-md hover:bg-secondary-container hover:text-on-primary transition-colors shadow-sm text-sm">Collect</button>
                                )}
                                {d.status === 'collected' && (
                                  <button onClick={() => updateStatus(d._id, 'distributed')} className="bg-[#4caf50] text-white px-4 py-2 rounded-lg font-label-md hover:bg-[#388e3c] transition-colors shadow-sm text-sm">Distribute</button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
              </section>
            </div>
          )}

          {tab === 'profile' && (
            <div className="bg-surface rounded-3xl shadow-[0px_4px_25px_rgba(26,35,126,0.05)] overflow-hidden animate-fade-in max-w-container-max mx-auto border border-outline-variant/30 flex flex-col">
              
              {/* Profile Cover Image Banner */}
              <div className="h-48 w-full bg-gradient-to-r from-primary via-[#283593] to-secondary relative flex items-end">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80')" }} />
                
                {/* Share Impact Floating Button */}
                <div className="absolute top-6 right-6 z-20">
                  <button onClick={shareImpact} className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white text-white hover:text-primary transition-all duration-300 rounded-full font-label-md shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-md border border-white/20 active:scale-95">
                    <span className="material-symbols-outlined text-[18px]">share</span> Share Impact
                  </button>
                </div>
              </div>

              {/* Profile Details Container */}
              <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row gap-8">
                
                {/* Left Side: Avatar & Verification Banner */}
                <div className="w-full md:w-1/3 flex flex-col items-center -mt-20 z-10">
                  <div className="w-40 h-40 rounded-full border-4 border-surface overflow-hidden mb-4 bg-surface-container-high flex items-center justify-center relative shadow-lg group cursor-pointer" onClick={() => setShowAvatarMenu(!showAvatarMenu)}>
                    {user?.avatar ? (
                      <img src={user.avatar.startsWith('http') ? user.avatar : `${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary text-on-primary flex items-center justify-center text-[60px] font-bold">
                        {user?.organizationName?.[0] || user?.name?.[0] || 'N'}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                      <span className="material-symbols-outlined text-white text-3xl">edit</span>
                    </div>

                    {showAvatarMenu && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 z-50 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <label className="w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-container transition-all shadow-lg active:scale-90" title="Upload Photo">
                          <span className="material-symbols-outlined text-base">upload</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleAvatarUpload(e); setShowAvatarMenu(false); }} />
                        </label>
                        {user?.avatar && (
                          <button 
                            onClick={() => { handleAvatarDelete(); setShowAvatarMenu(false); }}
                            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg active:scale-90"
                            title="Remove Photo"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                        <button 
                          onClick={() => setShowAvatarMenu(false)}
                          className="w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-90"
                          title="Cancel"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-primary mb-2 text-center capitalize">{user?.organizationName || user?.name}</h3>
                  <div className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${user?.isVerified ? 'bg-[#4caf50]/10 text-[#388e3c] border border-[#4caf50]/30' : 'bg-[#F57C00]/10 text-[#F57C00] border border-[#F57C00]/30'}`}>
                    <span className="material-symbols-outlined text-[14px]">{user?.isVerified ? 'verified' : 'pending_actions'}</span>
                    {user?.isVerified ? 'Verified NGO' : 'Verification Pending'}
                  </div>
                </div>

                {/* Right Side: Details and Stats */}
                <div className="w-full md:w-2/3 mt-6 md:mt-4 space-y-8">
                  <div>
                    <h3 className="font-h3 text-lg text-primary border-b border-outline-variant/30 pb-2 mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">corporate_fare</span>
                      Organization Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Email field */}
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Email Address</p>
                          <p className="font-medium text-on-surface break-all text-sm md:text-base">{user?.email}</p>
                        </div>
                      </div>

                      {/* Phone field */}
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">phone</span>
                        </div>
                        <div>
                          <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Contact Number</p>
                          <p className="font-medium text-on-surface text-sm md:text-base">{user?.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      {/* Registration field */}
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-[#ffab00]/10 text-[#ffab00] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">verified_user</span>
                        </div>
                        <div>
                          <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Registration Number</p>
                          <p className="font-medium text-on-surface text-sm md:text-base">{user?.registrationNumber || 'Not provided'}</p>
                        </div>
                      </div>

                      {/* Member Since field */}
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                        </div>
                        <div>
                          <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Member Since</p>
                          <p className="font-medium text-on-surface text-sm md:text-base">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
                        </div>
                      </div>

                      {/* Location field */}
                      <div className="md:col-span-2 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">location_on</span>
                        </div>
                        <div>
                          <p className="font-medium text-primary">{user?.address?.street || 'Street Address'}</p>
                          <p className="text-on-surface-variant">{[user?.address?.city, user?.address?.state, user?.address?.pincode].filter(Boolean).join(', ') || 'Not provided'}</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* About Us section */}
                  {user?.description && (
                    <div>
                      <h3 className="font-h3 text-lg text-primary border-b border-outline-variant/30 pb-2 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                        About Our Organization
                      </h3>
                      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 text-on-surface-variant leading-relaxed text-sm md:text-base shadow-sm">
                        {user.description}
                      </div>
                    </div>
                  )}

                  {/* Premium, Colorful Impact Badges */}
                  <div>
                    <h3 className="font-h3 text-lg text-primary border-b border-outline-variant/30 pb-2 mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">military_tech</span>
                      Our Impact Metrics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                      
                      {/* Pickups card */}
                      <div className="bg-gradient-to-br from-primary to-[#1a237e] p-6 rounded-2xl text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
                        <div className="absolute top-2 right-2 opacity-10 group-hover:scale-110 transition-transform duration-300">
                          <span className="material-symbols-outlined text-[80px]">local_shipping</span>
                        </div>
                        <p className="font-h1 text-4xl font-extrabold">{stats.total}</p>
                        <p className="font-label-md text-xs text-white/80 mt-2 uppercase tracking-wider font-bold">Total Pickups</p>
                      </div>

                      {/* Items Distributed card */}
                      <div className="bg-gradient-to-br from-secondary to-[#880e4f] p-6 rounded-2xl text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
                        <div className="absolute top-2 right-2 opacity-10 group-hover:scale-110 transition-transform duration-300">
                          <span className="material-symbols-outlined text-[80px]">inventory</span>
                        </div>
                        <p className="font-h1 text-4xl font-extrabold">{stats.totalItems}</p>
                        <p className="font-label-md text-xs text-white/80 mt-2 uppercase tracking-wider font-bold">Items Collected</p>
                      </div>

                      {/* Families Impacted card */}
                      <div className="bg-gradient-to-br from-[#ff6d00] to-[#dd2c00] p-6 rounded-2xl text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group">
                        <div className="absolute top-2 right-2 opacity-10 group-hover:scale-110 transition-transform duration-300">
                          <span className="material-symbols-outlined text-[80px]">diversity_1</span>
                        </div>
                        <p className="font-h1 text-4xl font-extrabold">{stats.familiesReached || 0}</p>
                        <p className="font-label-md text-xs text-white/80 mt-2 uppercase tracking-wider font-bold">Families Reached</p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-surface-container-highest border-t border-outline-variant flex flex-col items-center py-12 px-6 w-full mt-auto relative z-10">
          <div className="font-h3 text-h3 font-bold text-primary mb-6">Shareat</div>
          <div className="flex space-x-6 mb-6">
            <a onClick={() => navigate('/privacy')} className="text-on-surface-variant hover:text-primary font-caption text-caption hover:underline decoration-secondary transition-all cursor-pointer">Privacy Policy</a>
            <a onClick={() => navigate('/terms')} className="text-on-surface-variant hover:text-primary font-caption text-caption hover:underline decoration-secondary transition-all cursor-pointer">Terms of Service</a>
            <a onClick={() => navigate('/contact')} className="text-on-surface-variant hover:text-primary font-caption text-caption hover:underline decoration-secondary transition-all cursor-pointer">Contact Us</a>
          </div>
          <div className="text-on-surface font-caption text-caption">© 2024 Shareat. Building cultural continuity through giving.</div>
        </footer>

        {/* Selected Donation & Donor Information Details Modal */}
        {selected && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-surface rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
              
              {/* Cover Image / Category Indicator */}
              <div className="h-44 w-full relative bg-primary-container">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                <img 
                  src={
                    {
                      household: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
                      clothes: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80',
                      books: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
                      electronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80',
                      toys: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80',
                      other: 'https://images.unsplash.com/photo-1584263347416-85a696b4eda7?w=800&q=80'
                    }[selected.items[0]?.category] || 'https://images.unsplash.com/photo-1584263347416-85a696b4eda7?w=800&q=80'
                  } 
                  alt={selected.items[0]?.category} 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
                <div className="absolute bottom-4 left-6 z-20">
                  <div className="flex gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                      #{selected._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-white capitalize">
                      {selected.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white capitalize">{selected.items[0]?.name || `${selected.items[0]?.category} Donation`}</h2>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Donation & Item Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-h3 text-xs text-primary uppercase tracking-wider mb-2 font-bold">Items List</h4>
                      <div className="space-y-2 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                        {selected.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm font-medium text-on-surface">
                            <span>{categoryIcons[item.category]} {item.name || item.category}</span>
                            <span className="bg-surface-container px-2 py-0.5 rounded text-xs capitalize">Qty: {item.quantity} ({item.condition})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-h3 text-xs text-primary uppercase tracking-wider mb-2 font-bold">Pickup Time & Date</h4>
                      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-sm space-y-1.5">
                        <div className="flex items-center gap-2 text-on-surface">
                          <span className="material-symbols-outlined text-[16px] text-[#F57C00]">calendar_today</span>
                          <span>{new Date(selected.pickupDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface">
                          <span className="material-symbols-outlined text-[16px] text-[#F57C00]">schedule</span>
                          <span className="capitalize">{selected.pickupTimeSlot} Slot</span>
                        </div>
                      </div>
                    </div>

                    {selected.donorNotes && (
                      <div>
                        <h4 className="font-h3 text-xs text-primary uppercase tracking-wider mb-1 font-bold">Donor Notes</h4>
                        <p className="text-sm bg-surface-container-low p-3 rounded-2xl border border-outline-variant/30 text-on-surface-variant italic">
                          "{selected.donorNotes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Donor Contact & Address */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-h3 text-xs text-[#F57C00] uppercase tracking-wider mb-2 font-bold">Donor Details</h4>
                      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
                            {selected.donor?.name?.[0] || 'D'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">{selected.donor?.name || 'Anonymous Donor'}</p>
                            <p className="text-xs text-on-surface-variant">Donated on {new Date(selected.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-outline-variant/30 space-y-2">
                          <a href={`tel:${selected.donor?.phone}`} className="flex items-center gap-2 text-sm text-primary hover:text-secondary transition-colors font-medium">
                            <span className="material-symbols-outlined text-[18px]">phone</span>
                            <span>{selected.donor?.phone || 'Not Provided'}</span>
                          </a>
                          <a href={`mailto:${selected.donor?.email}`} className="flex items-center gap-2 text-sm text-primary hover:text-secondary transition-colors font-medium break-all">
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                            <span>{selected.donor?.email || 'Not Provided'}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-h3 text-xs text-[#F57C00] uppercase tracking-wider mb-2 font-bold">Pickup Location</h4>
                      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-sm space-y-2">
                        <div className="flex items-start gap-2 text-on-surface">
                          <span className="material-symbols-outlined text-[18px] text-[#F57C00] shrink-0 mt-0.5">location_on</span>
                          <div>
                            <p className="font-medium text-primary">{selected.pickupAddress?.street || 'Street Address'}</p>
                            <p className="text-on-surface-variant">{selected.pickupAddress?.city}, {selected.pickupAddress?.state} - {selected.pickupAddress?.pincode}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 bg-surface-container-low border-t border-outline-variant/30 flex justify-end gap-3 rounded-b-3xl">
                <button 
                  onClick={() => setSelected(null)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-variant font-label-md text-on-surface transition-colors"
                >
                  Close
                </button>
                {selected.status === 'pending' && (
                  <button 
                    onClick={() => { updateStatus(selected._id, 'accepted'); setSelected(null); }}
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md hover:bg-primary-container hover:text-on-primary-container font-bold transition-all shadow-md active:scale-95"
                  >
                    Accept Donation
                  </button>
                )}
                {selected.status === 'accepted' && (
                  <button 
                    onClick={() => { updateStatus(selected._id, 'collected'); setSelected(null); }}
                    className="bg-secondary text-white px-6 py-2.5 rounded-xl font-label-md hover:bg-secondary-container hover:text-on-primary font-bold transition-all shadow-md active:scale-95"
                  >
                    Collect Items
                  </button>
                )}
                {selected.status === 'collected' && (
                  <button 
                    onClick={() => { updateStatus(selected._id, 'distributed'); setSelected(null); }}
                    className="bg-[#4caf50] text-white px-6 py-2.5 rounded-xl font-label-md hover:bg-[#388e3c] font-bold transition-all shadow-md active:scale-95"
                  >
                    Mark Distributed
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
