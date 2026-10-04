import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import toast from 'react-hot-toast';
import { getRemainingTimeText } from '../utils/campusUpdatesStore';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // ─── Data States ───────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [studyMaterials, setStudyMaterials] = useState([]);
  const [studyLoading, setStudyLoading] = useState(false);

  const [needs, setNeeds] = useState([]);
  const [needsLoading, setNeedsLoading] = useState(false);

  const [campusUpdates, setCampusUpdates] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providerFilter, setProviderFilter] = useState('');

  // ─── Filters ──────────────────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    if (activeTab === 'marketplace' && items.length === 0) {
      fetchItems();
    } else if (activeTab === 'study' && studyMaterials.length === 0) {
      fetchStudyMaterials();
    } else if (activeTab === 'needs' && needs.length === 0) {
      fetchNeeds();
    } else if (activeTab === 'updates' && campusUpdates.length === 0) {
      fetchCampusUpdates();
    } else if (activeTab === 'services' && services.length === 0) {
      fetchServices();
    } else if (activeTab === 'orders' && orders.length === 0) {
      fetchOrders();
    } else if (activeTab === 'users' && users.length === 0) {
      fetchUsers();
    } else if (activeTab === 'reports' && reports.length === 0) {
      fetchReports();
    } else if (activeTab === 'providers' && providers.length === 0) {
      fetchProviders();
    }
  }, [activeTab]);

  // ─── API Fetchers ──────────────────────────────────────────────────────
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await API.get('/admin/dashboard');
      if (data.success) setStats(data.data);
    } catch (err) {
      console.warn('Dashboard stats error:', err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setItemsLoading(true);
      const { data } = await API.get('/items');
      if (data.success && Array.isArray(data.data)) setItems(data.data);
    } catch (err) {
      toast.error('Failed to load marketplace items');
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchStudyMaterials = async () => {
    try {
      setStudyLoading(true);
      const { data } = await API.get('/study');
      if (data.success && Array.isArray(data.data)) setStudyMaterials(data.data);
    } catch (err) {
      toast.error('Failed to load study materials');
    } finally {
      setStudyLoading(false);
    }
  };

  const fetchNeeds = async () => {
    try {
      setNeedsLoading(true);
      const { data } = await API.get('/needs');
      if (data.success && Array.isArray(data.data)) setNeeds(data.data);
    } catch (err) {
      toast.error('Failed to load campus needs');
    } finally {
      setNeedsLoading(false);
    }
  };

  const fetchCampusUpdates = async () => {
    try {
      setUpdatesLoading(true);
      const { data } = await API.get('/campus-updates');
      if (data.success && Array.isArray(data.data)) setCampusUpdates(data.data);
    } catch (err) {
      toast.error('Failed to load campus updates');
    } finally {
      setUpdatesLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const { data } = await API.get('/admin/services');
      if (data.success && Array.isArray(data.data)) setServices(data.data);
    } catch (err) {
      toast.error('Failed to load campus services');
    } finally {
      setServicesLoading(false);
    }
  };

  const handleToggleServiceStatus = async (id) => {
    try {
      const { data } = await API.patch(`/admin/services/${id}/status`);
      if (data.success) {
        toast.success(data.message || 'Service status updated');
        setServices((prev) => prev.map((s) => (s._id === id ? data.data : s)));
      }
    } catch (err) {
      toast.error('Failed to update service status');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this provider service listing?')) return;
    try {
      await API.delete(`/admin/services/${id}`);
      toast.success('Provider service deleted!');
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const handleDeleteComment = async (itemId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const { data } = await API.delete(`/admin/items/${itemId}/comments/${commentId}`);
      if (data.success) {
        toast.success('Comment deleted!');
        setItems((prev) =>
          prev.map((item) => (item._id === itemId ? { ...item, comments: data.data } : item))
        );
      }
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await API.get('/admin/orders');
      if (data.success && Array.isArray(data.data)) setOrders(data.data);
    } catch (err) {
      console.warn('Failed to load orders:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await API.get('/admin/users');
      if (data.success && Array.isArray(data.data)) setUsers(data.data);
    } catch (err) {
      toast.error('Failed to load registered users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const { data } = await API.get('/admin/reports');
      if (data.success && Array.isArray(data.data)) setReports(data.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setProvidersLoading(true);
      const { data } = await API.get('/admin/providers');
      if (data.success && Array.isArray(data.data)) setProviders(data.data);
    } catch (err) {
      toast.error('Failed to load provider applications');
    } finally {
      setProvidersLoading(false);
    }
  };

  const handleUpdateProviderStatus = async (id, status) => {
    try {
      const { data } = await API.patch(`/admin/providers/${id}/status`, { status });
      if (data.success) {
        toast.success(`Provider status updated to "${status}"`);
        setProviders(providers.map((p) => (p._id === id ? data.data : p)));
      }
    } catch (err) {
      toast.error('Failed to update provider status');
    }
  };

  const handleDeleteProvider = async (id) => {
    if (!window.confirm('Are you sure you want to delete this provider application?')) return;
    try {
      await API.delete(`/admin/providers/${id}`);
      toast.success('Provider application deleted');
      setProviders((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete provider');
    }
  };

  // ─── Admin Delete / Update Actions ─────────────────────────────────────
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this marketplace item?')) return;
    try {
      await API.delete(`/items/${id}`);
      toast.success('Marketplace item deleted!');
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const handleDeleteStudy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      await API.delete(`/study/${id}`);
      toast.success('Study material deleted!');
      setStudyMaterials((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      toast.error('Failed to delete study material');
    }
  };

  const handleDeleteNeed = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus need query?')) return;
    try {
      await API.delete(`/needs/${id}`);
      toast.success('Campus need query deleted!');
      setNeeds((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error('Failed to delete campus need');
    }
  };

  const handleFulfillNeed = async (id) => {
    try {
      await API.patch(`/needs/${id}/fulfill`);
      toast.success('Need query marked as fulfilled!');
      fetchNeeds();
    } catch (err) {
      toast.error('Failed to update need status');
    }
  };

  const handleDeleteUpdate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus update?')) return;
    try {
      await API.delete(`/campus-updates/${id}`);
      toast.success('Campus update deleted!');
      setCampusUpdates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error('Failed to delete campus update');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const { data } = await API.patch(`/admin/orders/${id}`, { status });
      if (data.success) {
        toast.success(`Order status updated to "${status}"`);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleReviewReport = async (id, status) => {
    try {
      const adminNote = window.prompt(`Add a note for this ${status} report (optional):`);
      const { data } = await API.patch(`/admin/reports/${id}/review`, { status, adminNote });
      if (data.success) {
        setReports(reports.map(r => r._id === id ? data.data : r));
        toast.success(`Report marked as ${status}`);
      }
    } catch (err) {
      toast.error('Failed to update report');
    }
  };

  // Formatters
  const formatPrice = (p) => (p !== undefined && p !== null ? `₹${Number(p).toLocaleString('en-IN')}` : 'Free');
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'N/A');

  const filteredOrdersList = orderFilter ? orders.filter(o => o.status === orderFilter) : orders;

  return (
    <div className="bg-[#f8fafc] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar activeLink="Admin" />

      <main className="flex-1 pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        
        {/* Header Title */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider border border-rose-200">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              <span>ADMIN CONTROL PANEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage data, moderation, users, and content across all website pages.
            </p>
          </div>

          <button
            onClick={() => {
              fetchDashboardStats();
              if (activeTab === 'marketplace') fetchItems();
              else if (activeTab === 'study') fetchStudyMaterials();
              else if (activeTab === 'needs') fetchNeeds();
              else if (activeTab === 'updates') fetchCampusUpdates();
              else if (activeTab === 'services') fetchServices();
              else if (activeTab === 'orders') fetchOrders();
              else if (activeTab === 'users') fetchUsers();
              else if (activeTab === 'reports') fetchReports();
              toast.success('Admin Dashboard Refreshed');
            }}
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Navigation Tabs (covering all pages of the website) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: '📊 Overview', count: null },
            { id: 'marketplace', label: '🛒 Marketplace Items', count: items.length || stats?.totalItems || 0 },
            { id: 'study', label: '📚 Study Materials', count: studyMaterials.length || stats?.totalStudyMaterials || 0 },
            { id: 'needs', label: '🔎 Campus Needs', count: needs.length || stats?.totalNeeds || 0 },
            { id: 'updates', label: '📢 Campus Updates', count: campusUpdates.length || stats?.totalUpdates || 0 },
            { id: 'services', label: '🧰 Services', count: services.length || stats?.totalServices || 0 },
            { id: 'orders', label: '📦 Orders', count: orders.length || stats?.totalOrders || 0 },
            { id: 'users', label: '👥 Registered Users', count: users.length || stats?.totalUsers || 0 },
            { id: 'providers', label: '🏢 Providers', count: providers.length || stats?.totalProviders || 0 },
            { id: 'reports', label: '🚩 Reports', count: reports.length || stats?.totalReports || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              {tab.label} {tab.count !== null && <span className="ml-1 opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* ── 1. OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">RESOURCE USAGE & ORDERS</span>
                <div className="text-2xl font-black text-slate-900">{stats?.totalOrders || orders.length || 0}</div>
                <span className="text-[10px] text-slate-500 font-medium">Campus service & product requests</span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">ACTIVE USERS</span>
                <div className="text-2xl font-black text-slate-900">{stats?.totalUsers || users.length || 0}</div>
                <span className="text-[10px] text-slate-500 font-medium">Registered students & accounts</span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">LISTED ITEMS & SERVICES</span>
                <div className="text-2xl font-black text-slate-900">{(stats?.totalItems || items.length || 0) + (stats?.totalServices || services.length || 0)}</div>
                <span className="text-[10px] text-slate-500 font-medium">Marketplace & Provider listings</span>
              </div>
            </div>

            {/* Quick Website Pages Data Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div onClick={() => setActiveTab('marketplace')} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition-all cursor-pointer space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🛒</span>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{items.length || stats?.totalItems || 0} Posts</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Marketplace Page</h3>
                <p className="text-xs text-slate-500 font-normal">Active product listings & items for buy/sell across campus.</p>
              </div>

              <div onClick={() => setActiveTab('study')} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 transition-all cursor-pointer space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📚</span>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{studyMaterials.length || stats?.totalStudyMaterials || 0} Materials</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Study Page</h3>
                <p className="text-xs text-slate-500 font-normal">Notes, PYQs, assignments & academic resources uploaded by students.</p>
              </div>

              <div onClick={() => setActiveTab('needs')} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-purple-400 transition-all cursor-pointer space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🔎</span>
                  <span className="text-xs font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">{needs.length || stats?.totalNeeds || 0} Queries</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Need Page</h3>
                <p className="text-xs text-slate-500 font-normal">Student requirement posts & item help queries around campus.</p>
              </div>

              <div onClick={() => setActiveTab('updates')} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-indigo-400 transition-all cursor-pointer space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📢</span>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{campusUpdates.length || stats?.totalUpdates || 0} Notices</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Campus Updates Page</h3>
                <p className="text-xs text-slate-500 font-normal">Live 24-hour campus notices, events, and sports announcements.</p>
              </div>

              <div onClick={() => setActiveTab('services')} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-amber-400 transition-all cursor-pointer space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🧰</span>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{services.length || stats?.totalServices || 0} Services</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Services Page</h3>
                <p className="text-xs text-slate-500 font-normal">Community mess/tiffin, water camper, laundry & rental services.</p>
              </div>

              <div onClick={() => setActiveTab('users')} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-rose-400 transition-all cursor-pointer space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">👥</span>
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">{users.length || stats?.totalUsers || 0} Users</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Users & Accounts</h3>
                <p className="text-xs text-slate-500 font-normal">Registered student accounts, admin roles & email verification.</p>
              </div>

            </div>
          </div>
        )}

        {/* ── 2. MARKETPLACE ITEMS TAB (/marketplace) ── */}
        {activeTab === 'marketplace' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Marketplace Listings (`/marketplace`)</h2>
                <p className="text-xs text-slate-500">All buy/sell product items published by students.</p>
              </div>
              <span className="text-xs font-extrabold text-slate-500">{items.length} items total</span>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No marketplace items found in MongoDB.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="py-3 px-3">Item</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Seller</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {items.map((item) => (
                      <React.Fragment key={item._id}>
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              {item.images?.[0] ? (
                                <img src={item.images[0]} alt={item.title} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">📦</div>
                              )}
                              <div>
                                <div className="font-extrabold text-slate-900">{item.title}</div>
                                <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-700">{formatPrice(item.price)}</td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold">{item.category}</span></td>
                          <td className="py-3 px-3">{item.seller?.name || item.sellerName || 'Campus Student'}</td>
                          <td className="py-3 px-3 text-slate-400">{formatDate(item.createdAt)}</td>
                          <td className="py-3 px-3 text-right space-x-1">
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer transition-colors"
                            >
                              Delete Post
                            </button>
                          </td>
                        </tr>

                        {/* Comments row if comments exist */}
                        {item.comments && item.comments.length > 0 && (
                          <tr className="bg-slate-50/60">
                            <td colSpan={6} className="px-4 py-2 border-b border-slate-100">
                              <div className="pl-6 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Post Comments ({item.comments.length}):</span>
                                <div className="flex flex-wrap gap-2">
                                  {item.comments.map((comment) => (
                                    <div key={comment._id} className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs">
                                      <span className="font-bold text-slate-800">{comment.userName}:</span>
                                      <span className="text-slate-600">{comment.text}</span>
                                      <button
                                        onClick={() => handleDeleteComment(item._id, comment._id)}
                                        className="text-rose-600 hover:text-rose-800 text-[10px] font-extrabold ml-1 cursor-pointer"
                                        title="Delete Comment"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 3. STUDY MATERIALS TAB (/study) ── */}
        {activeTab === 'study' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Study Materials (`/study`)</h2>
                <p className="text-xs text-slate-500">Academic notes, PYQs, and question papers uploaded by branch peers.</p>
              </div>
              <span className="text-xs font-extrabold text-slate-500">{studyMaterials.length} materials total</span>
            </div>

            {studyMaterials.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No study materials found in MongoDB.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="py-3 px-3">Title &amp; Subject</th>
                      <th className="py-3 px-3">Branch &amp; Year</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Uploaded By</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {studyMaterials.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900">{item.title}</div>
                          <div className="text-[10px] text-slate-500">{item.subject} &bull; {item.semester}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold">{item.branch} • {item.year}</td>
                        <td className="py-3 px-3"><span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">{item.contentType}</span></td>
                        <td className="py-3 px-3">{item.uploadedByName || item.uploadedBy?.name || 'Verified Student'}</td>
                        <td className="py-3 px-3 text-slate-400">{formatDate(item.createdAt)}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteStudy(item._id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 4. CAMPUS NEEDS TAB (/need) ── */}
        {activeTab === 'needs' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Campus Needs (`/need`)</h2>
                <p className="text-xs text-slate-500">Student requirement queries and help requests.</p>
              </div>
              <span className="text-xs font-extrabold text-slate-500">{needs.length} queries total</span>
            </div>

            {needs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No campus needs found in MongoDB.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="py-3 px-3">Title &amp; Description</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Budget</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">User</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {needs.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900">{item.title}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
                        </td>
                        <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold">{item.category}</span></td>
                        <td className="py-3 px-3 font-bold text-emerald-700">{item.budget || 'Flexible'}</td>
                        <td className="py-3 px-3">{item.location}</td>
                        <td className="py-3 px-3">{item.userName || item.user?.name || 'Student'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.status === 'FULFILLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {item.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          {item.status !== 'FULFILLED' && (
                            <button
                              onClick={() => handleFulfillNeed(item._id)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 cursor-pointer"
                            >
                              Fulfill
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNeed(item._id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 5. CAMPUS UPDATES TAB (/campus-updates) ── */}
        {activeTab === 'updates' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Campus Updates (`/campus-updates`)</h2>
                <p className="text-xs text-slate-500">Live 24-hour notices, events, and announcements.</p>
              </div>
              <span className="text-xs font-extrabold text-slate-500">{campusUpdates.length} updates total</span>
            </div>

            {campusUpdates.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No campus updates found in MongoDB.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="py-3 px-3">Title &amp; Notice</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Remaining Time</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {campusUpdates.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900">{item.title}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
                        </td>
                        <td className="py-3 px-3"><span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">{item.category}</span></td>
                        <td className="py-3 px-3">{item.location}</td>
                        <td className="py-3 px-3 font-bold text-amber-700">⏳ {getRemainingTimeText(item.expiresAt)}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteUpdate(item._id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 6. PROVIDER SERVICES TAB (/services) ── */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Provider Services (`/services`)</h2>
                <p className="text-xs text-slate-500">Mess/Tiffin, Water Camper, Laundry, Shop items, and Rentals published by providers.</p>
              </div>
              <span className="text-xs font-extrabold text-slate-500">{services.length} provider services total</span>
            </div>

            {services.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No provider services listed yet in MongoDB.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="py-3 px-3">Service &amp; Photo</th>
                      <th className="py-3 px-3">Category Type</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Provider Details</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {services.map((item) => {
                      const providerName = item.provider?.businessName || item.provider?.name || item.providerName || 'Registered Provider';
                      const providerPhone = item.provider?.phone || item.provider?.user?.phone || 'N/A';
                      const isHidden = item.status === 'hidden';
                      return (
                        <tr key={item._id} className={`hover:bg-slate-50/80 transition-colors ${isHidden ? 'opacity-60 bg-slate-50/50' : ''}`}>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              {item.images?.[0] ? (
                                <img src={item.images[0]} alt={item.title} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">🍱</div>
                              )}
                              <div>
                                <div className="font-extrabold text-slate-900">{item.title}</div>
                                <div className="text-[10px] text-slate-500 line-clamp-1">{item.description || item.schedule}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-black text-[10px] uppercase">
                              {item.type || item.category || 'Provider Service'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-extrabold text-emerald-700">₹{item.price || item.pricingDetails?.monthlyPrice || 0}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{providerName}</div>
                            <div className="text-[10px] text-slate-500">📱 {providerPhone}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              item.status === 'active' || !item.status ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {item.status === 'active' || !item.status ? 'Active 🟢' : 'Hidden 🔴'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1">
                            <button
                              onClick={() => handleToggleServiceStatus(item._id)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                            >
                              {item.status === 'active' || !item.status ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={() => handleDeleteService(item._id)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 7. ORDERS & RESOURCE USAGE TAB ── */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Resource Usages &amp; Student Orders</h2>
                <p className="text-xs text-slate-500">Track which students are using which website services, resources, or marketplace items.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="">All Orders &amp; Requests</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed / Active</option>
                  <option value="delivered">Delivered / Completed</option>
                </select>
              </div>
            </div>

            {filteredOrdersList.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No resource usages or orders recorded in MongoDB.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="py-3 px-3">Resource / Item Used</th>
                      <th className="py-3 px-3">Student / Buyer</th>
                      <th className="py-3 px-3">Provider / Seller</th>
                      <th className="py-3 px-3">Price / Rate</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredOrdersList.map((order) => {
                      const itemName = order.itemName || order.item?.title || 'Campus Resource';
                      const resourceType = order.type || 'Service Usage';
                      const buyerName = order.buyerName || order.buyer?.name || 'Campus Student';
                      const buyerContact = order.buyerContact || order.buyer?.phone || order.buyer?.email || 'N/A';
                      const sellerName = order.sellerName || order.seller?.name || 'Provider / Seller';
                      const priceVal = order.price || order.amount || 0;
                      const statusStr = order.status || 'Active';
                      return (
                        <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-slate-900">{itemName}</div>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{resourceType}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{buyerName}</div>
                            <div className="text-[10px] text-slate-500">📱 {buyerContact}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">{sellerName}</td>
                          <td className="py-3 px-3 font-bold text-emerald-700">{formatPrice(priceVal)}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              ['delivered', 'completed', 'active'].includes(String(statusStr).toLowerCase())
                                ? 'bg-emerald-100 text-emerald-800'
                                : ['confirmed', 'requested'].includes(String(statusStr).toLowerCase())
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {statusStr}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{formatDate(order.date || order.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 8. REGISTERED USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Registered Students &amp; Accounts</h2>
                <p className="text-xs text-slate-500">All registered college student accounts in MongoDB.</p>
              </div>
              <span className="text-xs font-extrabold text-slate-500">{users.length} users total</span>
            </div>

            {users.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No registered users found in MongoDB.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="py-3 px-3">Student Name</th>
                      <th className="py-3 px-3">College Email</th>
                      <th className="py-3 px-3">StudTrade ID</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Email Verified</th>
                      <th className="py-3 px-3 text-right">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-extrabold text-slate-900">{u.name}</td>
                        <td className="py-3 px-3 font-mono text-slate-700">{u.email}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-500">{u.studtradeID || 'ST-0000'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            u.role === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isEmailVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {u.isEmailVerified ? '✓ Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-400">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 9. PROVIDERS MANAGEMENT TAB ── */}
        {activeTab === 'providers' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Provider Applications & Verification</h2>
                <p className="text-xs text-slate-500">Review, approve, reject, or suspend campus service providers.</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['', 'pending', 'approved', 'rejected', 'suspended'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setProviderFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer border ${
                      providerFilter === st
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st === '' ? 'All Status' : st}
                  </button>
                ))}
              </div>
            </div>

            {providersLoading ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">Loading provider applications...</p>
            ) : providers.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No provider applications found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="py-3 px-3">Business Name / Owner</th>
                      <th className="py-3 px-3">Types</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Verification</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {(providerFilter ? providers.filter(p => p.verificationStatus === providerFilter) : providers).map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900">{p.businessName}</div>
                          <div className="text-[11px] text-slate-500">{p.name} ({p.email})</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {p.providerTypes?.map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{p.phone}</td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{p.location}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            p.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            p.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                            p.verificationStatus === 'suspended' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {p.verificationStatus || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          {p.verificationStatus !== 'approved' && (
                            <button
                              onClick={() => handleUpdateProviderStatus(p._id, 'approved')}
                              className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-all cursor-pointer"
                            >
                              ✓ Approve
                            </button>
                          )}
                          {p.verificationStatus === 'pending' && (
                            <button
                              onClick={() => handleUpdateProviderStatus(p._id, 'rejected')}
                              className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          {p.verificationStatus === 'approved' && (
                            <button
                              onClick={() => handleUpdateProviderStatus(p._id, 'suspended')}
                              className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProvider(p._id)}
                            className="p-1 rounded-xl hover:bg-rose-50 text-rose-600 text-xs cursor-pointer"
                            title="Delete Application"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 10. REPORTS & MODERATION TAB ── */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Content Moderation &amp; Reports</h2>
                <p className="text-xs text-slate-500">Flagged posts and user reports requiring admin review.</p>
              </div>
              <span className="text-xs font-extrabold text-slate-500">{reports.length} reports total</span>
            </div>

            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No reports or flagged posts right now.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="py-3 px-3">Reported Item</th>
                      <th className="py-3 px-3">Reported By</th>
                      <th className="py-3 px-3">Reason</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {reports.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-extrabold text-slate-900">{r.item?.title || 'Reported Post'}</td>
                        <td className="py-3 px-3">{r.reportedBy?.name || r.reportedBy?.email || 'Student'}</td>
                        <td className="py-3 px-3 text-slate-600">{r.reason}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            r.status === 'dismissed' ? 'bg-slate-100 text-slate-600' : r.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          {r.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReviewReport(r._id, 'reviewed')}
                                className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 cursor-pointer"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => handleReviewReport(r._id, 'dismissed')}
                                className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      <StitchFooter />
    </div>
  );
}
