import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProviderNotificationsTab({ provider }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/provider/notifications');
      if (data.success) {
        setNotifications(data.data);
        // Mark all as read
        API.patch('/provider/notifications/read').catch(() => {});
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Notifications</h2>
          <p className="text-xs text-slate-500 font-medium">
            System updates, student requests & admin alerts.
          </p>
        </div>
        <span className="material-symbols-outlined text-amber-500 text-2xl">notifications</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/90 text-center space-y-2">
          <div className="text-4xl">🔔</div>
          <h3 className="font-extrabold text-slate-900 text-base">No Notifications Yet</h3>
          <p className="text-xs text-slate-500">
            Important notifications and student requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-3xl border transition-all space-y-1 ${
                n.read ? 'bg-white border-slate-200/90' : 'bg-amber-50/50 border-amber-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">{n.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
