import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken, removeToken, getAuthHeaders } from '../utils/auth';

const API = '/api';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ users: {}, donations: {} });
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = getToken();
      if (!token) {
        navigate('/login');
        setLoading(false);
        return;
      }

      const cfg = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const [statsRes, usersRes] = await Promise.all([
          axios.get(`${API}/admin/stats`, cfg),
          axios.get(`${API}/admin/users?role=ngo`, cfg)
        ]);

        setStats(statsRes.data);
        setNgos(usersRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response?.status === 401 || error.response?.status === 403) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const toggleNgoVerification = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API}/admin/users/${id}/verify`, { isVerified: !currentStatus }, { headers: getAuthHeaders() });
      setNgos(ngos.map(ngo => ngo._id === id ? res.data : ngo));
      
      const statsRes = await axios.get(`${API}/admin/stats`, { headers: getAuthHeaders() });
      setStats(statsRes.data);
      
      showToast(currentStatus ? 'NGO Verification Revoked' : 'NGO Verified Successfully');
    } catch (error) {
      console.error('Error verifying NGO:', error);
      showToast('Failed to update verification status.', 'error');
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1a237e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#1a237e] font-semibold text-lg">Loading Admin Area…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.type === 'error' ? '✗' : '✓'} {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-[#1a237e] flex flex-col py-8 px-5 shadow-2xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl font-bold text-[#1a237e]">
              A
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Admin Portal</p>
              <p className="text-white/50 text-xs">System Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'overview', icon: '📊', label: 'Platform Overview' },
            { id: 'ngos',     icon: '🏢', label: 'NGO Management' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                ${tab === item.id
                  ? 'bg-white/20 text-white shadow'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-8 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#1a237e] mb-1">Admin Dashboard</h1>
            <p className="text-gray-500 mb-8">Platform metrics and health at a glance.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {[
                { label: 'Total Donors', value: stats.users.totalDonors, icon: '👤', color: 'bg-blue-50 border-blue-200' },
                { label: 'Total NGOs',   value: stats.users.totalNgos,   icon: '🏢', color: 'bg-purple-50 border-purple-200' },
                { label: 'Donation Requests', value: stats.donations.totalDonations, icon: '📦', color: 'bg-amber-50 border-amber-200' },
                { label: 'Items Distributed', value: stats.donations.totalItems || 0, icon: '🏆', color: 'bg-green-50 border-green-200' },
              ].map(s => (
                <div key={s.label} className={`${s.color} border rounded-2xl p-5 flex items-center gap-4 shadow-sm`}>
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <p className="text-3xl font-extrabold text-[#1a237e]">{s.value}</p>
                    <p className="text-xs text-gray-600 font-medium">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] text-white rounded-2xl p-8 shadow-lg flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Platform Impact</h2>
                <p className="text-white/80 max-w-md text-sm leading-relaxed">The Shareat platform has successfully coordinated {stats.donations.totalDonations} donations, distributing {stats.donations.totalItems || 0} items to families in need through our verified NGO partners.</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">🌍</div>
            </div>
          </div>
        )}

        {/* NGOs TAB */}
        {tab === 'ngos' && (
          <div>
            <h1 className="text-3xl font-extrabold text-[#1a237e] mb-1">NGO Management</h1>
            <p className="text-gray-500 mb-6">Verify and manage non-governmental organizations.</p>

            <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
              {ngos.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <p className="text-4xl mb-3">🏢</p>
                  <p>No NGOs registered on the platform yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="py-3 px-5 font-semibold text-[#1a237e]">NGO Details</th>
                        <th className="py-3 px-5 font-semibold text-[#1a237e]">Contact & Reg No.</th>
                        <th className="py-3 px-5 font-semibold text-[#1a237e]">Status</th>
                        <th className="py-3 px-5 font-semibold text-[#1a237e] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ngos.map(ngo => (
                        <tr key={ngo._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-5">
                            <p className="font-bold text-gray-800">{ngo.organizationName || ngo.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Joined {new Date(ngo.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="py-4 px-5">
                            <p className="text-gray-600 font-medium">{ngo.email}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Reg: {ngo.registrationNumber || 'N/A'}</p>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
                              ${ngo.isVerified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                              {ngo.isVerified ? '✓ Verified' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => toggleNgoVerification(ngo._id, ngo.isVerified)}
                              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                                ngo.isVerified
                                  ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                  : 'bg-[#1a237e] text-white hover:bg-[#283593]'
                              }`}
                            >
                              {ngo.isVerified ? 'Revoke Verification' : 'Verify NGO'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
