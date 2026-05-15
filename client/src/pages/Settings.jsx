import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatWidget from '../components/ChatWidget';


const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [notifications, setNotifications] = useState({ email: true, push: true, impact: true });
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', phone: '', bio: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);


  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        setProfileData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          bio: res.data.bio || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/auth/profile/avatar', formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        } 
      });
      setUser(res.data);
      alert('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:5000/api/auth/account', {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.removeItem('token');
        alert('Your account has been deleted.');
        navigate('/register');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  const sections = [
    { id: 'account', label: 'Account', icon: 'person' },
    { id: 'security', label: 'Security', icon: 'security' },
    { id: 'preferences', label: 'Preferences', icon: 'tune' },
    { id: 'help', label: 'Support & Help', icon: 'help' },
  ];

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/password', passwordData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setPasswordData({ currentPassword: '', newPassword: '' });
      alert('Password updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const renderSection = () => {
    if (loading) return <div className="flex justify-center p-10"><span className="animate-spin material-symbols-outlined text-primary text-3xl">sync</span></div>;

    switch (activeSection) {
      case 'account':
        return (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-primary text-2xl font-bold border-4 border-white shadow-sm overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (user?.name?.charAt(0) || 'U')}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="animate-spin material-symbols-outlined text-white text-xl">sync</span>
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 rounded-full hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                  <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">{user?.name || 'User'}</h3>
                <p className="text-on-surface-variant text-xs">{user?.email}</p>
                <label className="text-secondary text-[10px] font-bold mt-1 hover:underline cursor-pointer block">
                  Change Photo
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-2 uppercase">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary bg-white text-sm" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-2 uppercase">Phone</label>
                <input 
                  type="text" 
                  value={profileData.phone} 
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary bg-white text-sm" 
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-2 uppercase">Bio</label>
                <textarea 
                  placeholder="About you..." 
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary bg-white h-20 resize-none text-sm" 
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1a237e] transition-all active:scale-95 disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="animate-fade-in space-y-6">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <h3 className="text-base font-bold text-primary">Change Password</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-2 uppercase">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary bg-white text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-2 uppercase">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary bg-white text-sm" 
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="bg-secondary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#E65100] transition-all disabled:opacity-70"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-3 pt-4 border-t border-outline-variant/10">
              <h3 className="text-base font-bold text-primary">Security Options</h3>
              <div className="flex items-center justify-between p-3 border-b border-outline-variant/10">
                <div>
                  <p className="font-bold text-sm text-primary">Two-Factor (2FA)</p>
                  <p className="text-xs text-on-surface-variant">Secure your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-90">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-outline-variant/10">
                <div>
                  <p className="font-bold text-sm text-primary">Login Alerts</p>
                  <p className="text-xs text-on-surface-variant">Notify on new logins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-90">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="animate-fade-in space-y-6">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-primary">Notifications</h3>
              {Object.keys(notifications).map((key) => (
                <div key={key} className="flex items-center justify-between p-3 border-b border-outline-variant/10">
                  <p className="text-sm font-medium text-primary capitalize">{key} Alerts</p>
                  <label className="relative inline-flex items-center cursor-pointer scale-90">
                    <input 
                      type="checkbox" 
                      checked={notifications[key]} 
                      onChange={() => setNotifications({...notifications, [key]: !notifications[key]})}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-primary">Appearance</h3>
              <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-xl">dark_mode</span>
                  <p className="font-bold text-sm text-primary">Dark Mode</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-90">
                  <input 
                    type="checkbox" 
                    checked={darkMode} 
                    onChange={toggleDarkMode}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="animate-fade-in space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: 'quiz', title: 'FAQs', desc: 'Quick answers', action: () => setIsChatOpen(true) },
                { icon: 'chat_bubble', title: 'Support', desc: 'Contact our team', action: () => setIsChatOpen(true) },
                { icon: 'article', title: 'Privacy', desc: 'Data protection', action: () => alert('Privacy Policy will be updated soon.') },
                { icon: 'gavel', title: 'Terms', desc: 'Usage guidelines', action: () => alert('Terms & Conditions will be updated soon.') },
              ].map(item => (
                <div key={item.title} onClick={item.action} className="p-4 bg-white border border-outline-variant/30 rounded-2xl hover:shadow-sm hover:border-primary/50 transition-all cursor-pointer group flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-primary">{item.title}</h4>
                    <p className="text-[10px] text-on-surface-variant uppercase">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-5 bg-gradient-to-r from-primary to-[#283593] rounded-2xl text-white flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-sm">Need help?</h4>
                <p className="text-[10px] opacity-80 uppercase">Support is online 24/7</p>
              </div>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-xs hover:shadow-lg active:scale-95 transition-all"
              >
                Chat
              </button>

            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col md:flex-row font-sans">
      {/* Settings Sidebar */}
      <aside className="w-full md:w-72 bg-white md:min-h-screen p-6 border-r border-outline-variant/30">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#f0f0ff] rounded-full transition-colors text-primary">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-primary tracking-tight">Settings</h1>
        </div>

        <nav className="space-y-1.5">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                activeSection === s.id 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="mt-10 pt-6 border-t border-outline-variant/20">
          <button 
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Settings Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-primary capitalize mb-1">{activeSection}</h2>
            <p className="text-xs text-on-surface-variant">Update your {activeSection} info.</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0px_4px_24px_rgba(26,35,126,0.04)] border border-outline-variant/30 min-h-[400px]">
            {renderSection()}
          </div>

          {activeSection === 'account' && !loading && (
            <div className="mt-6 p-6 bg-red-50 rounded-2xl border border-red-100 flex flex-col md:flex-row justify-between items-center gap-3">
              <div>
                <h4 className="font-bold text-sm text-red-700">Delete Account</h4>
                <p className="text-[11px] text-red-600/70">Permanently remove data.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </main>

      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>

  );
};

export default Settings;
