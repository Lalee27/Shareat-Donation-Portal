import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/notifications/mark-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const getTimeLabel = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors text-primary shadow-sm">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">Notifications</h1>
          </div>
          {notifications.some(n => n.unread) && (
            <button 
              onClick={markAllRead}
              className="text-sm font-bold text-secondary hover:underline transition-all"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-primary font-medium">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-outline-variant/30 text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-primary-fixed/40 mb-4">notifications_off</span>
            <p className="text-on-surface-variant font-medium">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`p-6 rounded-3xl border transition-all duration-300 hover:shadow-md bg-white ${n.unread ? 'border-secondary/20 shadow-sm' : 'border-outline-variant/30 opacity-80'}`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    n.type === 'success' ? 'bg-green-50 text-green-600' : 
                    n.type === 'impact' ? 'bg-orange-50 text-orange-600' : 
                    n.type === 'warning' ? 'bg-red-50 text-red-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    <span className="material-symbols-outlined">
                      {n.type === 'success' ? 'check_circle' : n.type === 'impact' ? 'volunteer_activism' : n.type === 'warning' ? 'report' : 'info'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold ${n.unread ? 'text-primary' : 'text-on-surface-variant'}`}>{n.title}</h3>
                      <span className="text-xs text-on-surface-variant">{getTimeLabel(n.createdAt)}</span>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{n.message}</p>
                  </div>
                  {n.unread && (
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
