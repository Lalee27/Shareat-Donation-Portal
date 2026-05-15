import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Footer from '../components/Footer';

// Fix for Leaflet default icon issues in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
window.L = L;
L.Marker.prototype.options.icon = DefaultIcon;



// Helper component to recenter map when location changes
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15, { animate: true });
    }
  }, [position, map]);
  return null;
};

const TrackingMap = ({ donation, coords }) => {
  if (!donation) return null;

  const [currentPos, setCurrentPos] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = [position.coords.latitude, position.coords.longitude];
          setCurrentPos(newPos);
          console.log("Current Position Updated:", newPos);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Please enable location access in your browser settings.");
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Initial location request
  useEffect(() => {
    requestLocation();
    // Watch for movement
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPos([position.coords.latitude, position.coords.longitude]);
      },
      null,
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const seed = parseInt(donation._id.slice(-6), 16);
  const defaultDonorPos = [22.2887, 73.3637]; // Default to Parul University area if seed fails
  const defaultNgoPos = [22.3072, 73.1812]; // Vadodara area

  const donorPos = currentPos || (Array.isArray(coords?.donor) ? coords.donor : defaultDonorPos);
  const ngoPos = Array.isArray(coords?.ngo) ? coords.ngo : defaultNgoPos;
  
  return (
    <div className={`transition-all duration-500 ease-in-out relative z-[100] ${isFullscreen ? 'fixed inset-0 w-screen h-screen z-[9999] bg-white p-4' : 'h-[300px] w-full rounded-xl overflow-hidden shadow-inner border border-outline-variant/30'}`}>
      
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md hover:bg-white transition-colors text-primary flex items-center justify-center"
          title={isFullscreen ? "Exit Fullscreen" : "Expand Map"}
        >
          <span className="material-symbols-outlined">{isFullscreen ? 'close_fullscreen' : 'open_in_full'}</span>
        </button>
        <button 
          onClick={requestLocation}
          className="bg-[#F57C00] p-2 rounded-lg shadow-md hover:bg-[#E65100] transition-colors text-white flex items-center justify-center"
          title="My Location"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
      </div>

      <MapContainer center={donorPos} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap position={currentPos} />
        <Marker position={donorPos}>
          <Popup>
            <div className="font-bold text-primary">Your Location</div>
            <div className="text-xs">Parul University, Vadodara</div>
          </Popup>
        </Marker>
        {ngoPos && (
          <>
            <Marker position={ngoPos}>
              <Popup>
                <div className="font-bold text-secondary">NGO Location</div>
                <div className="text-xs">{donation.assignedNgo?.organizationName || "Assigned NGO"}</div>
              </Popup>
            </Marker>
            <Polyline positions={[donorPos, ngoPos]} color="#F57C00" weight={5} dashArray="10, 10" />
          </>
        )}
      </MapContainer>

      {!isFullscreen && (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-primary font-bold z-[1000] shadow-sm pointer-events-none flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          LIVE TRACKING: {currentPos ? 'ACTIVE' : 'WAITING FOR GPS'}
        </div>
      )}
    </div>
  );
};

const DonorDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, collected: 0, totalItems: 0, familiesReached: 0 });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', phone: '', address: { street: '', city: '', state: '', pincode: '' } });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // New Donation Form State
  const [formData, setFormData] = useState({
    itemType: 'clothes',
    itemName: '',
    quantity: 1,
    condition: 'good',
    street: '',
    city: '',
    state: '',
    pincode: '',
    pickupDate: '',
    pickupTimeSlot: 'morning'
  });

  const [activeCoords, setActiveCoords] = useState({ donor: null, ngo: null });

  const navigate = useNavigate();

  useEffect(() => {
    const geocodeAddress = async (addressObj) => {
      if (!addressObj) return null;
      try {
        const query = `${addressObj.street || ''} ${addressObj.city} ${addressObj.state} ${addressObj.pincode} India`;
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        if (res.data && res.data[0]) {
          return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
        }
      } catch (e) {
        console.error("Geocoding error:", e);
      }
      return null;
    };

    const updateCoords = async () => {
      const activeDonation = donations.find(d => d.status !== 'distributed' && d.status !== 'cancelled') || donations[0];
      if (activeDonation) {
        const dCoords = await geocodeAddress(activeDonation.pickupAddress);
        let nCoords = null;
        if (activeDonation.assignedNgo?.address) {
          nCoords = await geocodeAddress(activeDonation.assignedNgo.address);
        }
        setActiveCoords({ donor: dCoords, ngo: nCoords });
      }
    };

    if (donations.length > 0) {
      updateCoords();
    }
  }, [donations]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [statsRes, donationsRes, userRes, unreadCountRes] = await Promise.all([
          axios.get('http://localhost:5000/api/donations/stats', config),
          axios.get('http://localhost:5000/api/donations', config),
          axios.get('http://localhost:5000/api/auth/me', config),
          axios.get('http://localhost:5000/api/notifications/unread-count', config)
        ]);

        setStats(statsRes.data);
        setDonations(donationsRes.data.donations);
        setUser(userRes.data);
        setUnreadNotifications(unreadCountRes.data.count);
        setProfileData({
          name: userRes.data.name || '',
          phone: userRes.data.phone || '',
          address: userRes.data.address || { street: '', city: '', state: '', pincode: '' }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        items: [{
          category: formData.itemType,
          name: formData.itemName || `${formData.itemType} items`,
          quantity: formData.quantity,
          condition: formData.condition
        }],
        pickupAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        pickupDate: formData.pickupDate,
        pickupTimeSlot: formData.pickupTimeSlot
      };

      const res = await axios.post('http://localhost:5000/api/donations', payload, config);
      
      setDonations([res.data, ...donations]);
      setActiveTab('dashboard');
      
      // Update stats (Note: totalItems only updates when status is 'distributed' on server)
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1
      }));

      // Reset form
      setFormData({
        itemType: 'clothes',
        itemName: '',
        quantity: 1,
        condition: 'good',
        street: '',
        city: '',
        state: '',
        pincode: '',
        pickupDate: '',
        pickupTimeSlot: 'morning'
      });
    } catch (error) {
      console.error('Error creating donation:', error);
      alert('Failed to create donation. Please try again.');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/auth/profile', profileData, { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
      alert('Profile updated successfully!');
    } catch {
      alert('Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/password', passwordData, { headers: { Authorization: `Bearer ${token}` } });
      setPasswordData({ currentPassword: '', newPassword: '' });
      alert('Password updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/auth/profile/avatar', formData, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
      });
      setUser(res.data);
    } catch {
      alert('Failed to upload avatar');
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete('http://localhost:5000/api/auth/profile/avatar', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUser(res.data);
      alert('Profile picture deleted');
    } catch {
      alert('Failed to delete avatar');
    }
  };

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center font-h3 text-primary">Loading...</div>;
  }

  const activeDonation = donations.find(d => d.status !== 'distributed' && d.status !== 'cancelled') || donations[0];

  // Impact Calculations (Using server-provided stats for accuracy)
  const impactDonations = donations.filter(d => ['accepted', 'collected', 'distributed'].includes(d.status));
  const totalItemsDonated = stats.totalItems || 0;
  const estCarbonSaved = (totalItemsDonated * 5.2).toFixed(1); // approx 5.2 kg CO2 per item
  const familiesReached = stats.familiesReached || 0;
  
  // Line Chart Data (Monthly - Including collected)
  const monthlyDataMap = {};
  impactDonations.forEach(d => {
    const month = new Date(d.createdAt).toLocaleString('default', { month: 'short' });
    if (!monthlyDataMap[month]) monthlyDataMap[month] = 0;
    monthlyDataMap[month] += d.items.reduce((sum, item) => sum + item.quantity, 0);
  });
  const lineChartData = Object.keys(monthlyDataMap).map(key => ({ name: key, items: monthlyDataMap[key] }));

  // Pie Chart Data (Category - Including collected)
  const categoryDataMap = {};
  impactDonations.forEach(d => {
    d.items.forEach(item => {
      const cat = item.category.charAt(0).toUpperCase() + item.category.slice(1);
      if (!categoryDataMap[cat]) categoryDataMap[cat] = 0;
      categoryDataMap[cat] += item.quantity;
    });
  });
  const pieChartData = Object.keys(categoryDataMap).map(key => ({ name: key, value: categoryDataMap[key] }));
  const COLORS = ['#000666', '#F57C00', '#4c56af', '#fc820c', '#e0e0ff'];

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
            <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">dashboard</span> Dashboard
            </button>
            <button onClick={() => setActiveTab('donations')} className={`${activeTab === 'donations' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">volunteer_activism</span> My Donations
            </button>
            <button onClick={() => setActiveTab('pickup')} className={`${activeTab === 'pickup' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">local_shipping</span> Schedule Pickup
            </button>
            <button onClick={() => setActiveTab('inventory')} className={`${activeTab === 'inventory' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">inventory_2</span> Inventory
            </button>
            <button onClick={() => setActiveTab('impact')} className={`${activeTab === 'impact' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">monitoring</span> Impact
            </button>
            <button onClick={() => setActiveTab('profile')} className={`${activeTab === 'profile' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant'} rounded-xl font-label-md text-label-md flex items-center px-6 py-3 transition-all w-full text-left`}>
              <span className="material-symbols-outlined mr-3">person</span> Profile
            </button>
          </div>
          <div className="mt-auto px-6 pb-6 space-y-2">
            <button onClick={() => setActiveTab('pickup')} className="w-full bg-[#F57C00] hover:bg-[#BF360C] text-on-primary font-label-md text-label-md py-3 rounded-xl transition-colors duration-200 shadow-sm flex items-center justify-center">
              <span className="material-symbols-outlined mr-3 text-sm">add</span>
              New Donation
            </button>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="w-full text-on-surface-variant hover:bg-surface-variant font-label-md text-label-md py-3 rounded-xl transition-colors duration-200 flex items-center justify-center">
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
          <div className="font-h3 text-h3 text-primary capitalize">{activeTab === 'pickup' ? 'Schedule Pickup' : activeTab === 'donations' ? 'My Donations' : activeTab}</div>
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
            <img onClick={() => setActiveTab('profile')} alt="User Avatar" className="w-8 h-8 rounded-full border border-outline-variant cursor-pointer hover:ring-2 hover:ring-primary transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW00rc3lCQ27PL_Q9hQIUM5BNkD87m3NVcioH_4vRyY0zo-SKwVWh2xNJCYYFlXiMLCLHVNZnefGXDlGiX0G4_-8KaZFE7eFOkPNgYbfhYYaf7GD64Ll1Ispt94GEia8EClZhx8Ty_fIL0VMm5KXg5cp7tAId-TO_Q66jbXrzYEWoIookjFtjIkWr0AoP1rUVQlK6O41kXp7Rc1mc4noL2P_RVoxdLc8JVMxtldhKG_puYk5EGZxxplQLfZ1gqPTHn2PbD7Vg2xAU" />
          </div>
        </div>

        {/* Decorative background circles matching design */}
        <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full border-[40px] border-[#F57C00]/5"></div>
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] rounded-full border-[30px] border-[#000666]/5"></div>
          <div className="absolute top-1/2 -right-24 w-[300px] h-[300px] rounded-full border-[20px] border-[#F57C00]/5"></div>
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border-[35px] border-[#000666]/5"></div>
          <div className="absolute bottom-1/3 -left-16 w-[250px] h-[250px] rounded-full border-[20px] border-[#F57C00]/5"></div>
        </div>

        <div className="p-8 max-w-container-max mx-auto w-full space-y-8 flex-grow pb-24 relative z-10">
          
          {activeTab === 'pickup' && (
            <div className="bg-surface p-8 rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-[#F57C00] animate-fade-in relative z-20">
              <h2 className="font-h3 text-2xl text-primary font-bold mb-6">Schedule a New Donation</h2>
              <form onSubmit={handleCreateDonation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-md text-primary mb-1">Item Category</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface"
                    value={formData.itemType} onChange={e => setFormData({...formData, itemType: e.target.value})}
                  >
                    <option value="clothes">Clothes</option>
                    <option value="household">Household Items</option>
                    <option value="books">Books</option>
                    <option value="electronics">Electronics</option>
                    <option value="toys">Toys</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-primary mb-1">Item Name / Description</label>
                  <input 
                    type="text" required placeholder="E.g. 5 Winter Jackets"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface"
                    value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-primary mb-1">Quantity</label>
                  <input 
                    type="number" min="1" required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface"
                    value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-primary mb-1">Condition</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface"
                    value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}
                  >
                    <option value="new">New / Unused</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good Condition</option>
                    <option value="fair">Fair (Needs slight repair)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label-md text-primary mb-1">Street Address</label>
                  <textarea 
                    required rows="2"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface"
                    placeholder="Full street address with landmark"
                    value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})}
                  ></textarea>
                </div>
                <div>
                  <label className="block font-label-md text-primary mb-1">City</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface"
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-primary mb-1">State</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface"
                    value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-primary mb-1">Pincode</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface"
                    value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-primary mb-1">Pickup Date</label>
                  <input 
                    type="date" required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface"
                    value={formData.pickupDate} onChange={e => setFormData({...formData, pickupDate: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-4">
                  <button type="button" onClick={() => setActiveTab('dashboard')} className="px-8 py-3 rounded-xl font-label-md border border-outline-variant hover:bg-surface-variant transition-colors text-on-surface">Cancel</button>
                  <button type="submit" className="bg-[#F57C00] text-white px-8 py-3 rounded-xl font-label-md hover:bg-[#BF360C] transition-colors shadow-md">Schedule Pickup</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              {/* Hero Card */}
              <section className="bg-surface rounded-2xl shadow-[0px_4px_24px_rgba(26,35,126,0.08)] border-t-4 border-[#F57C00] overflow-hidden relative">
                <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10 min-h-[260px]">
                  <div className="flex-1 min-w-0">
                    <h1 className="font-h1 text-[2.5rem] leading-tight text-primary mb-3">Make a Difference Today</h1>
                    <p className="font-body-lg text-lg text-on-surface-variant mb-8 max-w-[500px]">Your generosity fuels our cultural continuity. Schedule a new donation and connect with local NGOs making a real impact.</p>
                    <button onClick={() => setActiveTab('pickup')} className="bg-[#F57C00] hover:bg-[#E65100] text-white font-semibold py-3 px-7 rounded-xl transition-colors duration-200 shadow-md flex items-center gap-2 w-max text-lg">
                      Schedule a New Donation
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-[360px] h-[240px] relative overflow-hidden rounded-xl shadow-sm bg-black">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                      poster="https://lh3.googleusercontent.com/aida-public/AB6AXuB9eSA5H-ioNzb4Xiso5GXtNklG7YctXHf4cCtApF8zzLFtjFjWePnUnwuRE28MNo_gBQo0rxIt98SGMlsemgUT4uRaZymVLV2_3jcmFD3OIZ9ZRUhjZcEXsvHo7v1lQVX1Km0r82Azj0eY-cVZwXgG9dwSKr_R8Cdv-gYh7zJRdr1aTFpguHMWwESOCOlfhgUXwL9F9xfhVMYhTfrxOAr6Z7pDtCycKTZTOEPDR4zWDx5L4xr-LBLWsptvDwuQ4N-ySssOPgX9waU"
                    >
                      <source src="/dashboard-video.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </section>

              {/* Stats & Tracking Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Tracking UI */}
                <div className="md:col-span-2 bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] p-md flex flex-col">
                  <h2 className="font-h3 text-h3 text-primary mb-md flex items-center">
                    <span className="material-symbols-outlined mr-sm text-[#F57C00]">local_shipping</span> Active Donation Status
                  </h2>
                  {activeDonation ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                      <div className="flex flex-col">
                        <div className="bg-surface-container-low rounded-lg p-md mb-md border border-outline-variant/30">
                          <div className="flex justify-between items-center mb-sm">
                            <span className="font-label-md text-label-md text-on-surface">Donation #{activeDonation._id.slice(-6).toUpperCase()}</span>
                            <span className="bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption px-sm py-1 rounded-full capitalize">{activeDonation.items[0]?.category}</span>
                          </div>
                          <div className="font-body-md text-body-md text-on-surface-variant">
                            Assigned to: {activeDonation.assignedNgo ? (activeDonation.assignedNgo.organizationName || activeDonation.assignedNgo.name) : 'Pending Assignment'}
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="relative flex justify-between items-center mt-auto mb-4 px-sm">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-variant z-0 rounded-full"></div>
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#000666] to-[#F57C00] z-0 rounded-full transition-all duration-500
                            ${activeDonation.status === 'pending' ? 'w-0' : activeDonation.status === 'accepted' ? 'w-1/3' : activeDonation.status === 'collected' ? 'w-2/3' : 'w-full'}
                          `}></div>
                          
                          {/* Step 1: Pending */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeDonation.status !== 'pending' ? 'bg-primary text-on-primary shadow-sm' : 'bg-[#F57C00] text-white shadow-[0px_8px_30px_rgba(26,35,126,0.08)] ring-4 ring-[#F57C00]/20'}`}>
                              {activeDonation.status !== 'pending' ? <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check</span> : <span className="material-symbols-outlined text-sm">schedule</span>}
                            </div>
                            <span className={`font-caption text-caption mt-xs text-center w-20 ${activeDonation.status === 'pending' ? 'text-[#F57C00] font-bold' : 'text-on-surface'}`}>Pending</span>
                          </div>

                          {/* Step 2: Accepted */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeDonation.status === 'accepted' ? 'bg-[#F57C00] text-white shadow-[0px_8px_30px_rgba(26,35,126,0.08)] ring-4 ring-[#F57C00]/20' : activeDonation.status === 'collected' || activeDonation.status === 'distributed' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant border-2 border-surface'}`}>
                              {activeDonation.status === 'collected' || activeDonation.status === 'distributed' ? <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check</span> : <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>handshake</span>}
                            </div>
                            <span className={`font-label-md text-label-md mt-xs text-center w-24 ${activeDonation.status === 'accepted' ? 'text-[#F57C00] font-bold' : 'text-on-surface-variant'}`}>Accepted</span>
                          </div>

                          {/* Step 3: Collected */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeDonation.status === 'collected' ? 'bg-[#F57C00] text-white shadow-[0px_8px_30px_rgba(26,35,126,0.08)] ring-4 ring-[#F57C00]/20' : activeDonation.status === 'distributed' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant border-2 border-surface'}`}>
                              {activeDonation.status === 'distributed' ? <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check</span> : <span className="material-symbols-outlined text-sm">directions_car</span>}
                            </div>
                            <span className={`font-caption text-caption mt-1 text-center w-24 ${activeDonation.status === 'collected' ? 'text-[#F57C00] font-bold' : 'text-on-surface-variant'}`}>Out for Pickup</span>
                          </div>

                          {/* Step 4: Distributed */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeDonation.status === 'distributed' ? 'bg-[#F57C00] text-white shadow-[0px_8px_30px_rgba(26,35,126,0.08)] ring-4 ring-[#F57C00]/20' : 'bg-surface-variant text-on-surface-variant border-2 border-surface'}`}>
                              <span className="material-symbols-outlined text-sm">inventory</span>
                            </div>
                            <span className={`font-caption text-caption mt-xs text-center w-20 ${activeDonation.status === 'distributed' ? 'text-[#F57C00] font-bold' : 'text-on-surface-variant'}`}>Delivered</span>
                          </div>
                        </div>
                      </div>

                      <div className="h-[300px] relative">
                        <TrackingMap donation={activeDonation} coords={activeCoords} />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm z-[1000] flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1.5"></span>
                          LIVE TRACKING
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-on-surface-variant font-body-md">No active donations at the moment.</div>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="flex flex-col gap-gutter">
                  <div className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] p-md border-t-4 border-primary flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-sm">
                      <span className="font-label-md text-label-md text-on-surface-variant">Total Items Donated</span>
                      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                      </div>
                    </div>
                    <div className="font-h2 text-h2 text-primary">{stats.totalItems || 0}</div>
                    <div className="font-caption text-caption text-on-surface-variant mt-xs">Across {stats.total} donations</div>
                  </div>
                  <div className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] p-md border-t-4 border-secondary-container flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-sm">
                      <span className="font-label-md text-label-md text-on-surface-variant">Impact Created</span>
                      <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                      </div>
                    </div>
                    <div className="font-h2 text-h2 text-primary">{stats.familiesReached || 0} <span className="font-h3 text-h3 text-on-surface-variant">Families</span></div>
                    <div className="font-caption text-caption text-on-surface-variant mt-1">Benefited from your donations</div>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <section className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] overflow-hidden border-t-4 border-outline-variant/30 mt-8">
                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                  <h2 className="font-h3 text-h3 text-primary">Recent Donations</h2>
                  <button onClick={() => setActiveTab('donations')} className="text-primary hover:text-secondary-container font-label-md text-label-md transition-colors flex items-center">
                    View All
                    <span className="material-symbols-outlined ml-1 text-sm">chevron_right</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant">
                        <th className="p-md font-medium border-b border-outline-variant/30">Date</th>
                        <th className="p-md font-medium border-b border-outline-variant/30">Product</th>
                        <th className="p-md font-medium border-b border-outline-variant/30">Category</th>
                        <th className="p-md font-medium border-b border-outline-variant/30">NGO Partner</th>
                        <th className="p-md font-medium border-b border-outline-variant/30">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md text-on-surface">
                      {donations.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No donations found.</td></tr>
                      ) : (
                        donations.map(d => (
                          <tr key={d._id} className="hover:bg-surface-container-lowest transition-colors group cursor-pointer border-b border-outline-variant/10">
                            <td className="p-md">{new Date(d.pickupDate).toLocaleDateString()}</td>
                            <td className="p-md font-medium">{d.items[0]?.name || 'N/A'}</td>
                            <td className="p-md">
                              <span className="bg-primary-fixed text-on-primary-fixed font-caption text-caption px-sm py-1 rounded-full capitalize">
                                {d.items[0]?.category}
                              </span>
                            </td>
                            <td className="p-md">{d.assignedNgo ? (d.assignedNgo.organizationName || d.assignedNgo.name) : 'Pending'}</td>
                            <td className="p-md">
                              <span className={`font-label-md text-label-md flex items-center capitalize
                                ${d.status === 'pending' ? 'text-on-surface-variant' : ''}
                                ${d.status === 'accepted' ? 'text-[#F57C00]' : ''}
                                ${d.status === 'collected' ? 'text-[#F57C00]' : ''}
                                ${d.status === 'distributed' ? 'text-primary' : ''}
                              `}>
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
                <div className="p-6 border-t border-outline-variant/30 flex justify-end">
                  <div className="flex space-x-3">
                    <button disabled className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md">1</button>
                    <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors font-label-md text-label-md">2</button>
                    <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'donations' && (
            <section className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] overflow-hidden border-t-4 border-outline-variant/30 animate-fade-in relative z-20">
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                <h2 className="font-h3 text-h3 text-primary">My Donations</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant">
                      <th className="p-md font-medium border-b border-outline-variant/30">Date</th>
                      <th className="p-md font-medium border-b border-outline-variant/30">Product</th>
                      <th className="p-md font-medium border-b border-outline-variant/30">Category</th>
                      <th className="p-md font-medium border-b border-outline-variant/30">NGO Partner</th>
                      <th className="p-md font-medium border-b border-outline-variant/30">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface">
                    {donations.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No donations found.</td></tr>
                    ) : (
                      donations.map(d => (
                        <tr key={d._id} className="hover:bg-surface-container-lowest transition-colors group cursor-pointer border-b border-outline-variant/10">
                          <td className="p-md">{new Date(d.pickupDate).toLocaleDateString()}</td>
                          <td className="p-md font-medium">{d.items[0]?.name || 'N/A'}</td>
                          <td className="p-md">
                            <span className="bg-primary-fixed text-on-primary-fixed font-caption text-caption px-sm py-1 rounded-full capitalize">
                              {d.items[0]?.category}
                            </span>
                          </td>
                          <td className="p-md">{d.assignedNgo ? (d.assignedNgo.organizationName || d.assignedNgo.name) : 'Pending'}</td>
                          <td className="p-md">
                            <span className={`font-label-md text-label-md flex items-center capitalize
                              ${d.status === 'pending' ? 'text-on-surface-variant' : ''}
                              ${d.status === 'accepted' ? 'text-[#F57C00]' : ''}
                              ${d.status === 'collected' ? 'text-[#F57C00]' : ''}
                              ${d.status === 'distributed' ? 'text-primary' : ''}
                            `}>
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
          )}

          {activeTab === 'inventory' && (
            <div className="bg-surface p-8 rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-[#000666] animate-fade-in relative z-20">
              <h2 className="font-h3 text-2xl text-primary font-bold mb-6">Your Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donations.flatMap(d => d.items.map((item, idx) => (
                  <div key={`${d._id}-${idx}`} className="border border-outline-variant/50 rounded-xl p-4 flex flex-col shadow-sm bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-bold text-xl">
                        {item.quantity}
                      </div>
                      <span className="bg-secondary-container text-on-secondary-container text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider">{item.category}</span>
                    </div>
                    <h3 className="font-h3 text-lg text-primary mb-1">{item.name}</h3>
                    <p className="text-on-surface-variant text-sm capitalize mb-4">Condition: {item.condition}</p>
                    <div className="mt-auto pt-3 border-t border-outline-variant/30 text-xs text-on-surface-variant flex justify-between">
                      <span>Donated on {new Date(d.createdAt).toLocaleDateString()}</span>
                      <span className="capitalize text-[#F57C00] font-bold">{d.status}</span>
                    </div>
                  </div>
                )))}
                {donations.length === 0 && (
                  <div className="col-span-full text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl text-primary/20 mb-4 block">inventory_2</span>
                    You haven't donated any items yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="bg-surface p-8 rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-[#F57C00] animate-fade-in relative z-20">
              <h2 className="font-h3 text-2xl text-primary font-bold mb-6">Your Impact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 text-center">
                  <span className="material-symbols-outlined text-4xl text-[#F57C00] mb-2">inventory_2</span>
                  <p className="font-h1 text-4xl font-bold text-primary">{totalItemsDonated}</p>
                  <p className="text-on-surface-variant font-label-md mt-1">Total Items Donated</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 text-center">
                  <span className="material-symbols-outlined text-4xl text-green-600 mb-2">eco</span>
                  <p className="font-h1 text-4xl font-bold text-green-700">{estCarbonSaved} <span className="text-xl">kg</span></p>
                  <p className="text-on-surface-variant font-label-md mt-1">Est. CO2 Saved</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 text-center">
                  <span className="material-symbols-outlined text-4xl text-blue-500 mb-2">family_home</span>
                  <p className="font-h1 text-4xl font-bold text-blue-600">{familiesReached}</p>
                  <p className="text-on-surface-variant font-label-md mt-1">Families Reached</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30">
                  <h3 className="font-h3 text-lg text-primary mb-6">Donations Over Time</h3>
                  <div className="h-64 w-full">
                    {lineChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <Line type="monotone" dataKey="items" stroke="#F57C00" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#767683' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: '#767683' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-on-surface-variant">No data available</div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30">
                  <h3 className="font-h3 text-lg text-primary mb-6">Items by Category</h3>
                  <div className="h-64 w-full">
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-on-surface-variant">No data available</div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-surface p-8 rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border-t-4 border-[#000666] animate-fade-in relative z-20">
              <h2 className="font-h3 text-2xl text-primary font-bold mb-6">Profile Settings</h2>
              
              <div className="flex flex-col md:flex-row gap-12">
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full border-4 border-primary-fixed overflow-hidden mb-4 bg-surface-container-high flex items-center justify-center relative group cursor-pointer" onClick={() => setShowAvatarMenu(!showAvatarMenu)}>
                    {user?.avatar ? (
                      <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[80px] text-primary/30 block">person</span>
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
                  <h3 className="text-xl font-bold text-primary mb-1">{user?.name}</h3>
                  <p className="text-on-surface-variant font-label-md capitalize">{user?.role}</p>
                </div>

                <div className="w-full md:w-2/3 space-y-8">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <h3 className="font-h3 text-lg text-primary border-b border-outline-variant/30 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-label-md text-primary mb-1">Full Name</label>
                        <input type="text" required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface" />
                      </div>
                      <div>
                        <label className="block font-label-md text-primary mb-1">Email</label>
                        <input type="email" value={user?.email} disabled className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface-variant opacity-70 cursor-not-allowed" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-label-md text-primary mb-1">Phone Number</label>
                        <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-label-md text-primary mb-1">Street Address</label>
                        <input type="text" value={profileData.address?.street} onChange={e => setProfileData({...profileData, address: {...profileData.address, street: e.target.value}})} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface" />
                      </div>
                      <div>
                        <label className="block font-label-md text-primary mb-1">City</label>
                        <input type="text" value={profileData.address?.city} onChange={e => setProfileData({...profileData, address: {...profileData.address, city: e.target.value}})} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface" />
                      </div>
                      <div>
                        <label className="block font-label-md text-primary mb-1">State</label>
                        <input type="text" value={profileData.address?.state} onChange={e => setProfileData({...profileData, address: {...profileData.address, state: e.target.value}})} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="bg-[#000666] text-white px-8 py-3 rounded-xl font-label-md hover:bg-[#1a237e] transition-colors shadow-md">Save Changes</button>
                    </div>
                  </form>

                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <h3 className="font-h3 text-lg text-primary border-b border-outline-variant/30 pb-2">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-label-md text-primary mb-1">Current Password</label>
                        <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface" />
                      </div>
                      <div>
                        <label className="block font-label-md text-primary mb-1">New Password</label>
                        <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-white text-on-surface" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="bg-[#F57C00] text-white px-8 py-3 rounded-xl font-label-md hover:bg-[#BF360C] transition-colors shadow-md">Update Password</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default DonorDashboard;
