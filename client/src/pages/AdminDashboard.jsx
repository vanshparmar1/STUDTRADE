import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getRemainingTimeText } from '../utils/campusUpdatesStore';
import { getImageUrl } from '../utils/imageUrl';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  // Promotions State
  const [promotions, setPromotions] = useState([]);
  const [promotionsLoading, setPromotionsLoading] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  const [promoForm, setPromoForm] = useState({
    title: '',
    description: '',
    offerText: 'SPECIAL OFFER',
    category: 'Offer',
    buttonText: 'Explore Now',
    buttonLink: '/marketplace',
    displayOrder: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
  });
  const [promoImageFile, setPromoImageFile] = useState(null);
  const [promoImagePreview, setPromoImagePreview] = useState('');
  const [promoSubmitting, setPromoSubmitting] = useState(false);

  // Search filter inside tables
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Effects ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'marketplace' && items.length === 0) fetchItems();
    else if (activeTab === 'study' && studyMaterials.length === 0) fetchStudyMaterials();
    else if (activeTab === 'needs' && needs.length === 0) fetchNeeds();
    else if (activeTab === 'updates' && campusUpdates.length === 0) fetchCampusUpdates();
    else if (activeTab === 'services' && services.length === 0) fetchServices();
    else if (activeTab === 'orders' && orders.length === 0) fetchOrders();
    else if (activeTab === 'users' && users.length === 0) fetchUsers();
    else if (activeTab === 'promotions') fetchPromotions();
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

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await API.get('/admin/orders');
      if (data.success && Array.isArray(data.data)) setOrders(data.data);
    } catch (err) {
      toast.error('Failed to load orders');
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
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      setPromotionsLoading(true);
      const { data } = await API.get('/promotions/admin');
      if (data.success && Array.isArray(data.data)) setPromotions(data.data);
    } catch (err) {
      toast.error('Failed to load promotions');
    } finally {
      setPromotionsLoading(false);
    }
  };

  // ─── Actions ──────────────────────────────────────────────────────────
  const handleToggleServiceStatus = async (id) => {
    try {
      const { data } = await API.patch(`/admin/services/${id}/status`);
      if (data.success) {
        toast.success(data.message || 'Service status updated');
        setServices((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: s.status === 'active' ? 'hidden' : 'active' } : s))
        );
      }
    } catch (err) {
      toast.error('Failed to update service status');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this provider service listing?')) return;
    try {
      const { data } = await API.delete(`/admin/services/${id}`);
      if (data.success) {
        toast.success('Service deleted successfully');
        setServices((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this marketplace item listing?')) return;
    try {
      await API.delete(`/items/${id}`);
      toast.success('Item deleted');
      setItems((prev) => prev.filter((i) => i._id !== id && i.id !== id));
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const handleDeleteStudyMaterial = async (id) => {
    if (!window.confirm('Delete this study material?')) return;
    try {
      await API.delete(`/study/${id}`);
      toast.success('Study material deleted');
      setStudyMaterials((prev) => prev.filter((m) => m._id !== id && m.id !== id));
    } catch (err) {
      toast.error('Failed to delete study material');
    }
  };

  const handleDeleteCampusUpdate = async (id) => {
    if (!window.confirm('Delete this campus update?')) return;
    try {
      await API.delete(`/campus-updates/${id}`);
      toast.success('Campus update deleted');
      setCampusUpdates((prev) => prev.filter((u) => u._id !== id && u.id !== id));
    } catch (err) {
      toast.error('Failed to delete campus update');
    }
  };

  // ─── Promotion Management Handlers ─────────────────────────────────────
  const handleOpenAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      title: '',
      description: '',
      offerText: 'SPECIAL OFFER',
      category: 'Offer',
      buttonText: 'Explore Now',
      buttonLink: '/marketplace',
      displayOrder: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true,
    });
    setPromoImageFile(null);
    setPromoImagePreview('');
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      title: promo.title,
      description: promo.description,
      offerText: promo.offerText || 'SPECIAL OFFER',
      category: promo.category || 'Offer',
      buttonText: promo.buttonText || 'Explore Now',
      buttonLink: promo.buttonLink || '/marketplace',
      displayOrder: promo.displayOrder || 0,
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
      isActive: promo.isActive !== false,
    });
    setPromoImageFile(null);
    setPromoImagePreview(promo.image ? getImageUrl(promo.image) : '');
    setIsPromoModalOpen(true);
  };

  const handlePromoImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPromoImageFile(file);
      setPromoImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    if (!promoForm.title.trim() || !promoForm.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      setPromoSubmitting(true);
      const formData = new FormData();
      formData.append('title', promoForm.title);
      formData.append('description', promoForm.description);
      formData.append('offerText', promoForm.offerText);
      formData.append('category', promoForm.category);
      formData.append('buttonText', promoForm.buttonText);
      formData.append('buttonLink', promoForm.buttonLink);
      formData.append('displayOrder', promoForm.displayOrder);
      if (promoForm.startDate) formData.append('startDate', promoForm.startDate);
      if (promoForm.endDate) formData.append('endDate', promoForm.endDate);
      formData.append('isActive', promoForm.isActive);

      if (promoImageFile) {
        formData.append('image', promoImageFile);
      }

      if (editingPromo) {
        const { data } = await API.put(`/promotions/${editingPromo._id}`, formData);
        if (data.success) {
          toast.success('Promotion updated successfully! 🎉');
          fetchPromotions();
          fetchDashboardStats();
          setIsPromoModalOpen(false);
        }
      } else {
        const { data } = await API.post('/promotions', formData);
        if (data.success) {
          toast.success('Promotion published to public carousel! 🎉');
          fetchPromotions();
          fetchDashboardStats();
          setIsPromoModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save promotion');
    } finally {
      setPromoSubmitting(false);
    }
  };

  const handleTogglePromoStatus = async (id) => {
    try {
      const { data } = await API.patch(`/promotions/${id}/status`);
      if (data.success) {
        toast.success(data.message || 'Status updated');
        setPromotions((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (err) {
      toast.error('Failed to update promotion status');
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotional slide?')) return;
    try {
      const { data } = await API.delete(`/promotions/${id}`);
      if (data.success) {
        toast.success('Promotion deleted');
        setPromotions((prev) => prev.filter((p) => p._id !== id));
        fetchDashboardStats();
      }
    } catch (err) {
      toast.error('Failed to delete promotion');
    }
  };

  // Navigation Items (Exactly 9 Sections)
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'bar_chart' },
    { id: 'marketplace', label: 'Marketplace Items', icon: 'shopping_bag', count: stats?.totalItems },
    { id: 'study', label: 'Study Materials', icon: 'menu_book', count: stats?.totalStudyMaterials },
    { id: 'needs', label: 'Campus Needs', icon: 'saved_search', count: stats?.totalNeeds },
    { id: 'updates', label: 'Campus Updates', icon: 'campaign', count: stats?.totalUpdates },
    { id: 'services', label: 'Services', icon: 'build', count: stats?.totalServices },
    { id: 'orders', label: 'Orders', icon: 'local_shipping', count: stats?.totalOrders },
    { id: 'users', label: 'Registered Users', icon: 'group', count: stats?.totalUsers },
    { id: 'promotions', label: 'Promotions & News', icon: 'stars', count: stats?.totalPromotions },
  ];

  const currentNav = navItems.find((n) => n.id === activeTab) || navItems[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      
      {/* TOP HEADER */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>

          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ADMIN PANEL</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{currentNav.label}</span>
            </h1>
          </div>
        </div>

        {/* Right Header Admin Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-black text-slate-900 leading-snug">{user?.name || 'Administrator'}</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200 inline-block self-end">
              Administrator
            </span>
          </div>

          <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center border border-slate-800 shadow-2xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <button
            onClick={() => logout && logout()}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
            title="Logout"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD LAYOUT (Sidebar + Main Content) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200/90 flex-col justify-between p-4 shrink-0 sticky top-[61px] h-[calc(100vh-61px)]">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-black tracking-wider text-slate-900 uppercase block">STUDTRADE</span>
              <span className="text-[10px] text-slate-500 font-bold">Admin Operations Panel</span>
            </div>

            <nav className="space-y-1">
              {navItems.map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === nav.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg">{nav.icon}</span>
                    <span>{nav.label}</span>
                  </div>

                  {nav.count !== undefined && nav.count !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === nav.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {nav.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>Public Website</span>
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
            <div className="bg-white w-72 h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase">STUDTRADE Admin</span>
                    <span className="text-[10px] text-slate-500 font-bold block">Management Menu</span>
                  </div>
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 text-slate-400">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((nav) => (
                    <button
                      key={nav.id}
                      onClick={() => {
                        setActiveTab(nav.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                        activeTab === nav.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-lg">{nav.icon}</span>
                        <span>{nav.label}</span>
                      </div>
                      {nav.count !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                          {nav.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => logout && logout()}
                  className="w-full py-2.5 rounded-2xl bg-rose-600 text-white font-extrabold text-xs cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 text-left">
          
          {/* 1. OVERVIEW SECTION */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stat Cards Grid */}
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-base">Platform Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ACTIVE USERS</span>
                    <div className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Registered accounts</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">MARKETPLACE ITEMS</span>
                    <div className="text-2xl font-black text-slate-900">{stats?.totalItems || 0}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Student trade listings</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STUDY MATERIALS</span>
                    <div className="text-2xl font-black text-slate-900">{stats?.totalStudyMaterials || 0}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Notes & PYQ papers</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CAMPUS NEEDS</span>
                    <div className="text-2xl font-black text-slate-900">{stats?.totalNeeds || 0}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Student request posts</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CAMPUS UPDATES</span>
                    <div className="text-2xl font-black text-slate-900">{stats?.totalUpdates || 0}</div>
                    <span className="text-[10px] text-slate-500 font-medium">24h Campus notices</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SERVICES</span>
                    <div className="text-2xl font-black text-slate-900">{stats?.totalServices || 0}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Provider listings</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ORDERS</span>
                    <div className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Completed transactions</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">PROMOTIONS</span>
                    <div className="text-2xl font-black text-emerald-600">{stats?.totalPromotions || 0}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Public carousel slides</span>
                  </div>

                </div>
              </div>

              {/* Quick Access Section */}
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-base">Quick Access Management</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'marketplace', title: 'Marketplace', desc: 'Manage student buy/sell listings', icon: 'shopping_bag', count: stats?.totalItems },
                    { id: 'study', title: 'Study Materials', desc: 'Manage notes & exam papers', icon: 'menu_book', count: stats?.totalStudyMaterials },
                    { id: 'needs', title: 'Campus Needs', desc: 'Manage student requirement posts', icon: 'saved_search', count: stats?.totalNeeds },
                    { id: 'updates', title: 'Campus Updates', desc: 'Manage 24h campus notices', icon: 'campaign', count: stats?.totalUpdates },
                    { id: 'services', title: 'Services', desc: 'Manage mess, water & rental providers', icon: 'build', count: stats?.totalServices },
                    { id: 'orders', title: 'Orders', desc: 'Track transactions & customers', icon: 'local_shipping', count: stats?.totalOrders },
                    { id: 'users', title: 'Users', desc: 'Manage registered student accounts', icon: 'group', count: stats?.totalUsers },
                    { id: 'promotions', title: 'Promotions', desc: 'Manage homepage carousel slides', icon: 'stars', count: stats?.totalPromotions },
                  ].map((card) => (
                    <div key={card.id} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-800 font-black text-lg flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined">{card.icon}</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm leading-tight">{card.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{card.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400">{card.count || 0} items</span>
                        <button
                          onClick={() => setActiveTab(card.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 2. MARKETPLACE ITEMS SECTION */}
          {activeTab === 'marketplace' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">Marketplace Item Listings ({items.length})</h3>
                <button onClick={fetchItems} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                  Refresh
                </button>
              </div>

              {itemsLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading items...</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">No marketplace items listed yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Seller</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {items.map((item) => (
                        <tr key={item._id || item.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            {item.images?.[0] && (
                              <img src={getImageUrl(item.images[0])} alt={item.title} className="w-8 h-8 rounded-lg object-cover" />
                            )}
                            <span>{item.title}</span>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-emerald-600">₹{item.price}</td>
                          <td className="py-3 px-4">{item.category}</td>
                          <td className="py-3 px-4">{item.seller?.name || 'Student'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteItem(item._id || item.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold"
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

          {/* 3. STUDY MATERIALS SECTION */}
          {activeTab === 'study' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">Study Materials & Notes ({studyMaterials.length})</h3>
                <button onClick={fetchStudyMaterials} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                  Refresh
                </button>
              </div>

              {studyLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading study materials...</div>
              ) : studyMaterials.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">No study materials uploaded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Branch / Year</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {studyMaterials.map((mat) => (
                        <tr key={mat._id || mat.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-900">{mat.title}</td>
                          <td className="py-3 px-4">{mat.subject}</td>
                          <td className="py-3 px-4">{mat.branch} • {mat.year}</td>
                          <td className="py-3 px-4">{mat.contentType}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteStudyMaterial(mat._id || mat.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold"
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

          {/* 4. CAMPUS NEEDS SECTION */}
          {activeTab === 'needs' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">Campus Needs Posts ({needs.length})</h3>
                <button onClick={fetchNeeds} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                  Refresh
                </button>
              </div>

              {needsLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading campus needs...</div>
              ) : needs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">No campus need posts found.</div>
              ) : (
                <div className="space-y-3">
                  {needs.map((need) => (
                    <div key={need._id || need.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-900">{need.title}</h4>
                        <p className="text-xs text-slate-500">{need.description}</p>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          {need.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. CAMPUS UPDATES SECTION */}
          {activeTab === 'updates' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">24-Hour Campus Updates ({campusUpdates.length})</h3>
                <button onClick={fetchCampusUpdates} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                  Refresh
                </button>
              </div>

              {updatesLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading updates...</div>
              ) : campusUpdates.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">No active campus updates found.</div>
              ) : (
                <div className="space-y-3">
                  {campusUpdates.map((up) => (
                    <div key={up._id || up.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-amber-700">{up.category}</span>
                        <h4 className="font-extrabold text-sm text-slate-900">{up.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{up.description}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteCampusUpdate(up._id || up.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. SERVICES SECTION */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">Campus Provider Services ({services.length})</h3>
                <button onClick={fetchServices} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                  Refresh
                </button>
              </div>

              {servicesLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading provider services...</div>
              ) : services.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">No provider services listed yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Provider Business</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {services.map((svc) => (
                        <tr key={svc._id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-900">{svc.title}</td>
                          <td className="py-3 px-4">{svc.provider?.businessName || 'Provider'}</td>
                          <td className="py-3 px-4">{svc.type}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">₹{svc.price} / {svc.priceUnit}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              svc.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {svc.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => handleToggleServiceStatus(svc._id)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                            >
                              {svc.status === 'active' ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={() => handleDeleteService(svc._id)}
                              className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold"
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

          {/* 7. ORDERS SECTION */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">Platform Orders & Transactions ({orders.length})</h3>
                <button onClick={fetchOrders} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                  Refresh
                </button>
              </div>

              {ordersLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">No order transactions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Buyer</th>
                        <th className="py-3 px-4">Item / Service</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {orders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord._id ? ord._id.slice(-6) : 'N/A'}</td>
                          <td className="py-3 px-4">{ord.buyerName || (typeof ord.buyer === 'object' ? ord.buyer?.name : ord.buyer) || 'N/A'}</td>
                          <td className="py-3 px-4 font-bold">{ord.itemName || (typeof ord.item === 'object' ? ord.item?.title : ord.item) || 'N/A'}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">₹{ord.price ?? ord.totalAmount ?? 0}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                              {ord.status || 'Paid'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {ord.date ? new Date(ord.date).toLocaleDateString() : (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 8. REGISTERED USERS SECTION */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">Registered Student Accounts ({users.length})</h3>
                <button onClick={fetchUsers} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                  Refresh
                </button>
              </div>

              {usersLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading user accounts...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">No registered users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                          <td className="py-3 px-4">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'provider'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 9. PROMOTIONS & NEWS SECTION */}
          {activeTab === 'promotions' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
              
              {/* Top Banner & Add Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider mb-1">
                    <span>🎯</span>
                    <span>HOMEPAGE PUBLIC CAROUSEL CONTROL</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Promotions & News Slides
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Publish dynamic promotional banners, offers, and campus announcements displayed on the STUDTRADE homepage.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddPromo}
                  className="px-5 py-2.5 rounded-2xl gradient-primary text-white font-extrabold text-xs shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  <span>+ Add Promotion</span>
                </button>
              </div>

              {/* Promotions Table */}
              {promotionsLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-bold">Loading promotional slides...</div>
              ) : promotions.length === 0 ? (
                <div className="p-10 text-center space-y-3 border border-slate-200/80 rounded-2xl bg-slate-50/50">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl mx-auto">
                    🎯
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">No dynamic promotions published yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click <strong>"+ Add Promotion"</strong> to create custom promotional slides for the public website.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                        <th className="py-3.5 px-4">Slide</th>
                        <th className="py-3.5 px-4">Title & Description</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Offer Text</th>
                        <th className="py-3.5 px-4">Order</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {promotions.map((promo) => (
                        <tr key={promo._id} className="hover:bg-slate-50/70">
                          {/* Image preview */}
                          <td className="py-3.5 px-4">
                            {promo.image ? (
                              <img src={getImageUrl(promo.image)} alt={promo.title} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                                🎯
                              </div>
                            )}
                          </td>

                          {/* Title */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{promo.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{promo.description}</p>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black">
                              {promo.category || 'Offer'}
                            </span>
                          </td>

                          {/* Offer Text */}
                          <td className="py-3.5 px-4 font-bold text-emerald-600">
                            {promo.offerText || 'SPECIAL OFFER'}
                          </td>

                          {/* Display Order */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            #{promo.displayOrder || 0}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              promo.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {promo.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button
                              onClick={() => handleTogglePromoStatus(promo._id)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                                promo.isActive ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {promo.isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => handleOpenEditPromo(promo)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeletePromo(promo._id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs"
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

        </main>
      </div>

      {/* PROMOTION FORM MODAL */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-left animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingPromo ? 'Edit Promotion Slide' : 'Add New Promotion Slide'}
                </h3>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitPromo} className="space-y-4 text-left">
              
              {/* Image Upload Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Upload Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePromoImageChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                />
                {promoImagePreview && (
                  <div className="mt-2.5 w-full h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={promoImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  placeholder="e.g. Student Deals Are Here 🎉"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="e.g. Discover useful items and services from students around your campus."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              {/* Offer Text & Category Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Offer / Highlight Text
                  </label>
                  <input
                    type="text"
                    value={promoForm.offerText}
                    onChange={(e) => setPromoForm({ ...promoForm, offerText: e.target.value })}
                    placeholder="e.g. FLAT 20% OFF"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={promoForm.category}
                    onChange={(e) => setPromoForm({ ...promoForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="Offer">Offer</option>
                    <option value="News">News</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              </div>

              {/* Button Text & Button Link */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={promoForm.buttonText}
                    onChange={(e) => setPromoForm({ ...promoForm, buttonText: e.target.value })}
                    placeholder="e.g. Explore Deals"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={promoForm.buttonLink}
                    onChange={(e) => setPromoForm({ ...promoForm, buttonLink: e.target.value })}
                    placeholder="e.g. /marketplace"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Display Order & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={promoForm.displayOrder}
                    onChange={(e) => setPromoForm({ ...promoForm, displayOrder: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={promoForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.value === 'active' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={promoSubmitting}
                  className="w-full py-3 rounded-2xl gradient-primary text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  {promoSubmitting ? 'Publishing...' : editingPromo ? 'Save Changes' : 'Publish Promotion'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
