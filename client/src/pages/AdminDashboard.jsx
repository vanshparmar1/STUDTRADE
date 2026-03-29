import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // ─── Stats Data ────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ─── Orders Data ───────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // ─── Reports Data (Legacy Support) ─────────────────────────────────────
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // ─── Filters ────────────────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState('');
  const filteredOrders = orderFilter ? orders.filter(o => o.status === orderFilter) : orders;

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardStats();
      fetchOrders();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, statusFilter]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await API.get('/admin/dashboard');
      if (data.success) setStats(data.data);
    } catch (err) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await API.get('/admin/orders');
      if (data.success) setOrders(data.data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const { data } = await API.get(`/admin/reports?status=${statusFilter}`);
      if (data.success) setReports(data.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  };

  const handleReview = async (id, status) => {
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

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar />

      <main className="flex-1 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[var(--color-on-surface)]">Admin Control Panel</h1>
            <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Manage platform operations securely
            </p>
          </div>

          <div className="flex bg-[var(--color-surface-container-low)] p-1.5 rounded-2xl w-full md:w-auto overflow-hidden">
            {['overview', 'orders', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:w-32 py-2.5 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-[var(--color-primary)] shadow-sm' 
                    : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ─── TAB: OVERVIEW ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Stats Cards */}
            {statsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="bg-[var(--color-surface-container-low)] h-32 rounded-3xl" />)}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: 'account_balance_wallet', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Total Orders', value: stats.totalOrders, icon: 'receipt_long', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' },
                  { label: 'Active Users', value: stats.totalUsers, icon: 'group', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Listed Items', value: stats.totalItems, icon: 'inventory_2', color: 'text-orange-500', bg: 'bg-orange-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-[var(--color-surface-variant)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <p className="font-bold text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">{stat.label}</p>
                      <span className={`material-symbols-outlined ${stat.color} p-2 ${stat.bg} rounded-xl`}>{stat.icon}</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter text-[var(--color-on-surface)] relative z-10">{stat.value}</h3>
                    <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                  </div>
                ))}
              </div>
            ) : null}

            {/* Orders Table */}
            <div className="bg-white border border-[var(--color-surface-variant)] rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[var(--color-surface-variant)] flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--color-primary)]">list_alt</span>
                <h2 className="text-lg font-bold">Recent Orders</h2>
              </div>
              
              <div className="overflow-x-auto">
                {ordersLoading ? (
                  <div className="flex justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-3xl text-[var(--color-primary)]">refresh</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 text-[var(--color-on-surface-variant)]">
                    <span className="material-symbols-outlined text-4xl block opacity-30 mb-2">receipt</span>
                    <p className="font-medium text-sm">No orders found.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--color-surface-container-lowest)] text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] border-b border-[var(--color-outline-variant)]">
                        <th className="px-6 py-4 font-bold">Item</th>
                        <th className="px-6 py-4 font-bold">Buyer</th>
                        <th className="px-6 py-4 font-bold">Seller</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o._id} className="border-b border-[var(--color-outline-variant)]/50 hover:bg-[var(--color-surface-container-low)] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={o.item?.images?.[0] || 'https://placehold.co/40x40'} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" alt="" />
                              <div>
                                <p className="font-bold text-[var(--color-on-surface)] truncate max-w-[150px]">{o.item?.title || 'Unknown Item'}</p>
                                <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">{formatPrice(o.price)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold">{o.deliveryAddress?.name || o.buyer?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-[var(--color-on-surface-variant)]">{o.buyer?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold">{o.seller?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-[var(--color-on-surface-variant)]">{o.seller?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${
                              o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                              o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-bold text-[var(--color-on-surface-variant)] text-xs">{formatDate(o.createdAt)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: ORDERS ─────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Orders</h2>
              <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="bg-white border text-sm border-[var(--color-outline-variant)] rounded-xl px-4 py-2 font-bold text-[var(--color-on-surface)] outline-none focus:border-[var(--color-primary)] shadow-sm transition-all"
              >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="bg-white border border-[var(--color-surface-variant)] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                {ordersLoading ? (
                  <div className="flex justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-3xl text-[var(--color-primary)]">refresh</span>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-20 text-[var(--color-on-surface-variant)]">
                    <span className="material-symbols-outlined text-4xl block opacity-30 mb-2">receipt_long</span>
                    <p className="font-medium">No orders matched criteria.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-[var(--color-surface-container-lowest)] text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] border-b border-[var(--color-outline-variant)]">
                        <th className="px-6 py-4 font-bold">Item</th>
                        <th className="px-6 py-4 font-bold max-w-[200px]">Buyer (Delivery)</th>
                        <th className="px-6 py-4 font-bold max-w-[200px]">Seller (Pickup)</th>
                        <th className="px-6 py-4 font-bold">Method</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredOrders.map((o) => (
                        <tr key={o._id} className="border-b border-[var(--color-outline-variant)]/50 hover:bg-[var(--color-surface-container-low)] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={o.item?.images?.[0] || 'https://placehold.co/40x40'} className="w-10 h-10 rounded-lg object-cover border border-[var(--color-outline-variant)] shrink-0" alt="" />
                              <div>
                                <p className="font-bold text-[var(--color-on-surface)] truncate max-w-[150px]" title={o.item?.title || 'Unknown Item'}>{o.item?.title || 'Unknown Item'}</p>
                                <p className="text-[10px] font-bold text-[var(--color-primary)]">{formatPrice(o.price)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">person</span>{o.deliveryAddress?.name || o.buyer?.name || 'Unknown'}</span>
                              <span className="text-[12px] text-[var(--color-on-surface-variant)] flex items-center gap-1.5 mt-0.5"><span className="material-symbols-outlined text-[12px]">call</span>{o.deliveryAddress?.phone || o.buyer?.phone || 'N/A'}</span>
                              <span className="text-[12px] text-[var(--color-on-surface-variant)] flex items-start gap-1.5 mt-1.5 whitespace-normal break-words max-w-[250px]"><span className="material-symbols-outlined text-[12px] mt-0.5 shrink-0">location_on</span>{o.deliveryAddress?.fullAddress ? `${o.deliveryAddress.fullAddress}${o.deliveryAddress.city ? `, ${o.deliveryAddress.city}` : ''}${o.deliveryAddress.pincode ? ` - ${o.deliveryAddress.pincode}` : ''}` : 'No address provided'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">storefront</span>{o.seller?.name || 'Unknown'}</span>
                              <span className="text-[12px] text-[var(--color-on-surface-variant)] flex items-center gap-1.5 mt-0.5"><span className="material-symbols-outlined text-[12px]">call</span>{o.seller?.phone || 'N/A'}</span>
                              <span className="text-[12px] text-[var(--color-on-surface-variant)] flex items-start gap-1.5 mt-1.5 whitespace-normal break-words max-w-[250px]"><span className="material-symbols-outlined text-[12px] mt-0.5 shrink-0">inventory_2</span>{o.item?.pickupAddress?.fullAddress ? `${o.item.pickupAddress.fullAddress}${o.item.pickupAddress.city ? `, ${o.item.pickupAddress.city}` : ''}${o.item.pickupAddress.pincode ? ` - ${o.item.pickupAddress.pincode}` : ''}` : 'Pickup address not specified'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold uppercase text-[10px] tracking-widest">{o.paymentMethod || 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${
                              o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                              o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-bold text-[var(--color-on-surface-variant)] text-xs">{formatDate(o.createdAt)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: REPORTS ──────────────────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border text-sm border-[var(--color-outline-variant)] rounded-xl px-4 py-2 font-bold text-[var(--color-on-surface)] outline-none focus:border-[var(--color-primary)] transition-all"
              >
                  <option value="">All Reports</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {reportsLoading ? (
               <div className="flex justify-center py-20">
                 <span className="material-symbols-outlined animate-spin text-3xl text-[var(--color-primary)]">refresh</span>
               </div>
            ) : reports.length === 0 ? (
                <div className="bg-[var(--color-surface-container-low)] rounded-3xl p-20 text-center border border-[var(--color-outline-variant)]">
                    <span className="material-symbols-outlined text-4xl block opacity-30 mb-2">task_alt</span>
                    <h2 className="text-xl font-bold tracking-tight">No reports found</h2>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Everything looks good.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reports.map((report) => (
                        <div key={report._id} className="bg-white border border-[var(--color-surface-variant)] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row gap-6">
                                <img src={report.item?.images?.[0] || 'https://placehold.co/100x100'} alt="" className="w-full md:w-32 h-32 object-cover object-center rounded-2xl max-w-full overflow-hidden bg-[var(--color-surface-container)] shrink-0" />

                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                                              report.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                              report.status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {report.status}
                                            </span>
                                            <h3 className="text-lg font-bold mt-2">{report.item?.title || 'Unknown Item'}</h3>
                                            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Reported by: <span className="font-bold">{report.reportedBy?.name || report.reportedBy?._id}</span></p>
                                        </div>
                                        <div className="text-right text-[10px] text-[var(--color-on-surface-variant)] font-bold uppercase tracking-widest">
                                            {formatDate(report.createdAt)}
                                        </div>
                                    </div>

                                    <div className="bg-[var(--color-error)]/5 border border-[var(--color-error)]/20 p-4 rounded-xl italic text-sm text-[var(--color-error)] mb-4">
                                        "{report.reason}"
                                    </div>

                                    {report.adminNote && (
                                        <div className="bg-[var(--color-surface-container-low)] p-3 rounded-xl text-xs font-bold text-[var(--color-on-surface-variant)] mb-4 flex gap-2 items-center">
                                            <span className="material-symbols-outlined text-[14px]">edit_note</span>
                                            Admin Note: {report.adminNote}
                                        </div>
                                    )}

                                    {report.status === 'pending' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleReview(report._id, 'reviewed')}
                                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                                            >
                                                Mark Reviewed
                                            </button>
                                            <button
                                                onClick={() => handleReview(report._id, 'dismissed')}
                                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}
      </main>
      <StitchFooter />
    </div>
  );
}
