import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

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

  const token = localStorage.getItem('token');

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
      alert(`Status updated to "${status}"`);
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
      alert('Failed to upload avatar');
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the profile picture?')) return;
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.delete(`${API}/auth/profile/avatar`, cfg);
      setUser(res.data);
      alert('Profile picture deleted');
    } catch {
      alert('Failed to delete avatar');
    }
  };

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center font-h3 text-primary">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row bg-background min-h-screen">
      {/* Web SideNavBar */}
      <nav className="hidden md:flex bg-surface-container-low dark:bg-surface-dim h-screen left-0 w-64 border-r border-outline-variant fixed top-0 z-40">
        <div className="flex flex-col h-full p-sm space-y-xs w-full">
          <div className="px-md py-lg">
            <div className="font-h3 text-h3 font-bold text-primary dark:text-primary-fixed">Shareat</div>
            <div className="font-caption text-caption text-on-surface-variant mt-1">Social Impact Platform</div>
          </div>
          <div className="flex-grow flex flex-col space-y-1">
            <button onClick={() => { setTab('overview'); setSelected(null); }} className={`${tab === 'overview' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">dashboard</span> Overview
            </button>
            <button onClick={() => { setTab('donations'); setSelected(null); }} className={`${tab === 'donations' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">volunteer_activism</span> Donations
            </button>
            <button onClick={() => { setTab('profile'); setSelected(null); }} className={`${tab === 'profile' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">person</span> Profile
            </button>
          </div>
          <div className="mt-auto px-6 pb-6 space-y-2">
            <button onClick={handleLogout} className="w-full text-on-surface-variant hover:bg-surface-variant font-label-md text-label-md py-3 rounded-xl transition-colors duration-200 flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined mr-3 text-sm">logout</span>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative z-30 bg-background overflow-hidden" style={{ marginLeft: '256px' }}>
        
        {/* Web TopAppBar */}
        <div className="hidden md:flex bg-white shadow-sm border-b border-outline-variant/30 justify-between items-center px-6 h-16 w-full sticky top-0 z-30">
          <div className="font-h3 text-h3 text-primary capitalize">{tab === 'overview' ? 'NGO Dashboard' : tab}</div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <span onClick={() => navigate('/notifications')} className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high rounded-full p-2 transition-all duration-200">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </div>
            <span onClick={() => navigate('/settings')} className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high rounded-full p-2 transition-all duration-200">settings</span>
            <span className="font-label-md text-primary">{user?.organizationName || user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold border border-outline-variant cursor-pointer hover:ring-2 hover:ring-primary transition-all overflow-hidden" onClick={() => setTab('profile')}>
              {user?.avatar ? (
                <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'N'
              )}
            </div>
          </div>
        </div>

        {/* Decorative background circles */}
        <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full border-[40px] border-[#F57C00]/5"></div>
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] rounded-full border-[30px] border-[#000666]/5"></div>
          <div className="absolute top-1/2 -right-24 w-[300px] h-[300px] rounded-full border-[20px] border-[#F57C00]/5"></div>
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border-[35px] border-[#000666]/5"></div>
          <div className="absolute bottom-1/3 -left-16 w-[250px] h-[250px] rounded-full border-[20px] border-[#F57C00]/5"></div>
        </div>

        <div className="p-8 max-w-container-max mx-auto w-full space-y-8 flex-grow pb-24 relative z-10">
          
          {tab === 'overview' && (
            <div className="animate-fade-in space-y-8">
              <section className="bg-surface rounded-2xl shadow-[0px_4px_24px_rgba(26,35,126,0.08)] border-t-4 border-[#000666] overflow-hidden relative">
                <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10 min-h-[160px]">
                  <div className="flex-1 min-w-0">
                    <h1 className="font-h1 text-[2.5rem] leading-tight text-primary mb-3">Welcome, {user?.organizationName || user?.name}</h1>
                    <p className="font-body-lg text-lg text-on-surface-variant">Here's your impact and pending tasks at a glance.</p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats Grid */}
                <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Pickups', value: stats.total, icon: 'inventory_2', color: 'text-primary', bg: 'bg-primary-container' },
                    { label: 'Pending', value: stats.pending, icon: 'schedule', color: 'text-[#F57C00]', bg: 'bg-[#F57C00]/10' },
                    { label: 'Accepted', value: stats.accepted, icon: 'handshake', color: 'text-secondary', bg: 'bg-secondary-container' },
                    { label: 'Collected', value: stats.collected, icon: 'local_shipping', color: 'text-tertiary', bg: 'bg-tertiary-container' },
                    { label: 'Distributed', value: stats.distributed, icon: 'volunteer_activism', color: 'text-primary', bg: 'bg-primary-container' },
                    { label: 'Total Items', value: stats.totalItems, icon: 'category', color: 'text-secondary', bg: 'bg-secondary-container' },
                  ].map(s => (
                    <div key={s.label} className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] p-md flex items-center gap-4 border border-outline-variant/30">
                      <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center ${s.color}`}>
                        <span className="material-symbols-outlined">{s.icon}</span>
                      </div>
                      <div>
                        <p className="font-h2 text-h2 text-primary">{s.value}</p>
                        <p className="font-label-md text-label-md text-on-surface-variant">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Impact Cards */}
                <div className="flex flex-col gap-4">
                  <div className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] p-md border-t-4 border-primary flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-sm">
                      <span className="font-label-md text-label-md text-on-surface-variant">Families Reached</span>
                      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-sm">family_home</span>
                      </div>
                    </div>
                    <div className="font-h2 text-h2 text-primary">{stats.distributed * 3}</div>
                    <div className="font-caption text-caption text-on-surface-variant mt-xs">Based on distributed donations</div>
                  </div>
                  <div className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] p-md border-t-4 border-[#F57C00] flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-sm">
                      <span className="font-label-md text-label-md text-on-surface-variant">Est. CO2 Saved</span>
                      <div className="w-8 h-8 rounded-full bg-[#F57C00]/10 flex items-center justify-center text-[#F57C00]">
                        <span className="material-symbols-outlined text-sm">eco</span>
                      </div>
                    </div>
                    <div className="font-h2 text-h2 text-[#F57C00]">{(stats.totalItems * 0.8).toFixed(1)} <span className="font-h3 text-h3 text-on-surface-variant">kg</span></div>
                    <div className="font-caption text-caption text-on-surface-variant mt-xs">Environmental impact</div>
                  </div>
                </div>
              </div>

              {/* Pending Requests */}
              <section className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] overflow-hidden border-t-4 border-outline-variant/30 mt-8">
                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                  <h2 className="font-h3 text-h3 text-primary">Pending Requests</h2>
                  <button onClick={() => { setTab('donations'); setFilter('pending'); }} className="text-primary hover:text-secondary-container font-label-md text-label-md transition-colors flex items-center">
                    View All
                    <span className="material-symbols-outlined ml-1 text-sm">chevron_right</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant">
                        <th className="p-md font-medium border-b border-outline-variant/30">Donor</th>
                        <th className="p-md font-medium border-b border-outline-variant/30">Location</th>
                        <th className="p-md font-medium border-b border-outline-variant/30">Items</th>
                        <th className="p-md font-medium border-b border-outline-variant/30 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md text-on-surface">
                      {donations.filter(d => d.status === 'pending').length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No pending requests right now.</td></tr>
                      ) : (
                        donations.filter(d => d.status === 'pending').slice(0, 5).map(d => (
                          <tr key={d._id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/10">
                            <td className="p-md font-medium text-primary">{d.donor?.name || 'Unknown'}</td>
                            <td className="p-md">{d.pickupAddress?.city}</td>
                            <td className="p-md">{d.items.map(i => `${i.quantity}× ${i.name || i.category}`).join(', ')}</td>
                            <td className="p-md text-right">
                              <button onClick={() => updateStatus(d._id, 'accepted')} className="bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md hover:bg-[#1a237e] transition-colors shadow-sm text-sm">Accept</button>
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

          {tab === 'donations' && (
            <div className="flex flex-col xl:flex-row gap-8 animate-fade-in relative z-20">
              <div className={`flex-1 ${selected ? 'hidden xl:block' : ''}`}>
                <section className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] overflow-hidden border-t-4 border-outline-variant/30">
                  <div className="p-6 border-b border-outline-variant/30">
                    <h2 className="font-h3 text-h3 text-primary mb-4">Donation Requests</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
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
                      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                        {['all', 'pending', 'accepted', 'collected', 'distributed'].map(f => (
                          <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full font-label-md text-sm capitalize whitespace-nowrap transition-colors border
                              ${filter === f ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-variant'}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
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
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-body-md text-on-surface">
                        {filtered.length === 0 ? (
                          <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No donations match your filters.</td></tr>
                        ) : (
                          filtered.map(d => (
                            <tr key={d._id} onClick={() => setSelected(d)} className={`hover:bg-surface-container-lowest transition-colors cursor-pointer border-b border-outline-variant/10 ${selected?._id === d._id ? 'bg-primary-container/20' : ''}`}>
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
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Detail Panel */}
              {selected && (
                <div className="w-full xl:w-96 bg-surface rounded-xl shadow-[0px_8px_30px_rgba(26,35,126,0.12)] border border-outline-variant/30 p-6 self-start sticky top-24 xl:top-24 z-30 animate-fade-in">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
                    <h3 className="font-h3 text-xl text-primary">Donation Details</h3>
                    <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-2">Donor Information</p>
                      <p className="font-h3 text-lg text-primary">{selected.donor?.name}</p>
                      <div className="flex items-center text-on-surface-variant mt-1 text-sm"><span className="material-symbols-outlined text-sm mr-2">mail</span> {selected.donor?.email}</div>
                      <div className="flex items-center text-on-surface-variant mt-1 text-sm"><span className="material-symbols-outlined text-sm mr-2">phone</span> {selected.donor?.phone}</div>
                    </div>

                    <div>
                      <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-2">Pickup Address</p>
                      <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 text-sm">
                        <p>{selected.pickupAddress?.street}</p>
                        <p>{selected.pickupAddress?.city}, {selected.pickupAddress?.state} - {selected.pickupAddress?.pincode}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-2">Schedule</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-primary text-sm font-medium"><span className="material-symbols-outlined text-sm mr-2">calendar_today</span> {new Date(selected.pickupDate).toDateString()}</div>
                        <div className="flex items-center text-primary text-sm font-medium capitalize"><span className="material-symbols-outlined text-sm mr-2">schedule</span> {selected.pickupTimeSlot}</div>
                      </div>
                    </div>

                    <div>
                      <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-2">Items Included</p>
                      <div className="space-y-2">
                        {selected.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
                            <div>
                              <p className="font-medium text-primary text-sm">{categoryIcons[item.category]} {item.name}</p>
                              <p className="text-xs text-on-surface-variant capitalize mt-1">Condition: {item.condition}</p>
                            </div>
                            <div className="bg-primary-container text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                              {item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selected.donorNotes && (
                      <div className="bg-[#F57C00]/10 p-4 rounded-xl border border-[#F57C00]/20">
                        <p className="font-label-md text-xs text-[#F57C00] uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-sm text-on-surface">{selected.donorNotes}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-outline-variant/30">
                      <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-4">Actions</p>
                      <div className="space-y-3">
                        {selected.status === 'pending' && (
                          <button onClick={() => updateStatus(selected._id, 'accepted')} className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md hover:bg-[#1a237e] transition-colors shadow-sm flex items-center justify-center">
                            <span className="material-symbols-outlined mr-2">check_circle</span> Accept Donation
                          </button>
                        )}
                        {selected.status === 'accepted' && (
                          <button onClick={() => updateStatus(selected._id, 'collected')} className="w-full py-3 rounded-xl bg-[#F57C00] text-white font-label-md hover:bg-[#E65100] transition-colors shadow-sm flex items-center justify-center">
                            <span className="material-symbols-outlined mr-2">local_shipping</span> Mark as Collected
                          </button>
                        )}
                        {selected.status === 'collected' && (
                          <button onClick={() => updateStatus(selected._id, 'distributed')} className="w-full py-3 rounded-xl bg-[#4caf50] text-white font-label-md hover:bg-[#388e3c] transition-colors shadow-sm flex items-center justify-center">
                            <span className="material-symbols-outlined mr-2">inventory</span> Mark as Distributed
                          </button>
                        )}
                        {selected.status === 'distributed' && (
                          <div className="w-full py-3 rounded-xl bg-surface-container-low text-on-surface-variant font-label-md flex items-center justify-center border border-outline-variant/30">
                            <span className="material-symbols-outlined mr-2">done_all</span> Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="bg-surface p-8 rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-[#000666] animate-fade-in relative z-20">
              <h2 className="font-h3 text-2xl text-primary font-bold mb-8">NGO Profile</h2>
              
              <div className="flex flex-col md:flex-row gap-12">
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full border-4 border-primary-fixed overflow-hidden mb-4 bg-surface-container-high flex items-center justify-center relative shadow-md group cursor-pointer" onClick={() => setShowAvatarMenu(!showAvatarMenu)}>
                    {user?.avatar ? (
                      <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary text-on-primary flex items-center justify-center text-[60px] font-bold">
                        {user?.organizationName?.[0] || user?.name?.[0] || 'N'}
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                      <span className="material-symbols-outlined text-white text-3xl">edit</span>
                    </div>

                    {/* Click Menu */}
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
                  <h3 className="text-2xl font-bold text-primary mb-2 text-center">{user?.organizationName || user?.name}</h3>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${user?.isVerified ? 'bg-[#4caf50]/10 text-[#388e3c]' : 'bg-[#F57C00]/10 text-[#F57C00]'}`}>
                    {user?.isVerified ? 'Verified NGO' : 'Verification Pending'}
                  </div>
                </div>

                <div className="w-full md:w-2/3 space-y-8">
                  <div>
                    <h3 className="font-h3 text-lg text-primary border-b border-outline-variant/30 pb-2 mb-6">Organization Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">Email</p>
                        <p className="font-medium text-on-surface bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">{user?.email}</p>
                      </div>
                      <div>
                        <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">Phone</p>
                        <p className="font-medium text-on-surface bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">{user?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">Registration Number</p>
                        <p className="font-medium text-on-surface bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">{user?.registrationNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">Member Since</p>
                        <p className="font-medium text-on-surface bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">Location</p>
                        <p className="font-medium text-on-surface bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
                          {[user?.address?.street, user?.address?.city, user?.address?.state, user?.address?.pincode].filter(Boolean).join(', ') || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {user?.description && (
                    <div>
                      <h3 className="font-h3 text-lg text-primary border-b border-outline-variant/30 pb-2 mb-6">About Us</h3>
                      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 text-on-surface">
                        {user.description}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-outline-variant/30">
                    <div className="bg-primary-container p-4 rounded-xl text-center">
                      <p className="font-h2 text-2xl text-primary">{stats.total}</p>
                      <p className="font-label-md text-xs text-on-surface-variant mt-1 uppercase">Pickups</p>
                    </div>
                    <div className="bg-secondary-container p-4 rounded-xl text-center">
                      <p className="font-h2 text-2xl text-secondary">{stats.totalItems}</p>
                      <p className="font-label-md text-xs text-on-surface-variant mt-1 uppercase">Items</p>
                    </div>
                    <div className="bg-[#F57C00]/10 p-4 rounded-xl text-center">
                      <p className="font-h2 text-2xl text-[#F57C00]">{stats.distributed * 3}</p>
                      <p className="font-label-md text-xs text-on-surface-variant mt-1 uppercase">Families</p>
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
            <a className="text-on-surface-variant hover:text-primary font-caption text-caption hover:underline decoration-secondary transition-all cursor-pointer">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary font-caption text-caption hover:underline decoration-secondary transition-all cursor-pointer">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-primary font-caption text-caption hover:underline decoration-secondary transition-all cursor-pointer">Contact Us</a>
          </div>
          <div className="text-on-surface font-caption text-caption">© 2024 Shareat. Building cultural continuity through giving.</div>
        </footer>
      </main>
    </div>
  );
}
