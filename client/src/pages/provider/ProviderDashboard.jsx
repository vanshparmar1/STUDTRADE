import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StitchNavbar from '../../components/StitchNavbar';
import StitchFooter from '../../components/StitchFooter';
import toast from 'react-hot-toast';

import ProviderServicesTab from './ProviderServicesTab';
import ProviderCustomersTab from './ProviderCustomersTab';
import ProviderNotificationsTab from './ProviderNotificationsTab';
import ProviderProfileTab from './ProviderProfileTab';
import QuickUpdateModal from './QuickUpdateModal';

export default function ProviderDashboard({ defaultTab = 'dashboard' }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const [servicesCount, setServicesCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);

  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  useEffect(() => {
    fetchProviderInfo();
  }, []);

  const fetchProviderInfo = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/provider/me');
      if (data.success) {
        setProvider(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch provider info:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (provider?._id) {
      fetchCounts();
    }
  }, [provider]);

  const fetchCounts = async () => {
    try {
      const [svcRes, custRes, reqRes] = await Promise.all([
        API.get('/provider/services').catch(() => ({ data: { count: 0 } })),
        API.get('/provider/customers').catch(() => ({ data: { count: 0 } })),
        API.get('/provider/requests').catch(() => ({ data: { count: 0 } })),
      ]);

      if (svcRes.data?.success) setServicesCount(svcRes.data.count || 0);
      if (custRes.data?.success) setCustomersCount(custRes.data.count || 0);
      if (reqRes.data?.success) setRequestsCount(reqRes.data.count || 0);
    } catch (err) {
      console.warn('Error fetching counts:', err.message);
    }
  };

  const providerTypes = provider?.providerTypes || ['Other Service'];
  const isMess = providerTypes.includes('Mess / Tiffin');
  const isWater = providerTypes.includes('Water Camper');
  const isRental = providerTypes.includes('Rental');
  const isShop = providerTypes.includes('Shop');
  const isOther = providerTypes.includes('Other Service');

  return (
    <div className="bg-[#f8fafc] text-slate-800 min-h-screen flex flex-col font-sans pb-24 md:pb-12">
      <StitchNavbar activeLink="Services" />

      <main className="flex-1 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        
        {/* Verification Status Alert Banner */}
        {provider?.verificationStatus === 'pending' && (
          <div className="bg-amber-500/10 border border-amber-300 rounded-3xl p-4 flex items-start sm:items-center gap-3 text-amber-900 text-xs sm:text-sm font-medium">
            <span className="text-2xl shrink-0">⏳</span>
            <div className="flex-1">
              <strong className="font-extrabold block">Your provider application is submitted & pending admin verification.</strong>
              <span>STUDTRADE admin is reviewing your account request. Once approved by the admin, you will be able to upload and display your services to campus students.</span>
            </div>
          </div>
        )}

        {provider?.verificationStatus === 'suspended' && (
          <div className="bg-rose-500/10 border border-rose-300 rounded-3xl p-4 flex items-start sm:items-center gap-3 text-rose-900 text-xs sm:text-sm font-medium">
            <span className="text-2xl shrink-0">⛔</span>
            <div className="flex-1">
              <strong className="font-extrabold block">Your provider account is currently suspended.</strong>
              <span>Public listings are hidden from students. Please contact STUDTRADE admin to reactivate your account.</span>
            </div>
          </div>
        )}

        {/* Dashboard Header Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">
                Hello, {provider?.name || user?.name || 'Provider'} 👋
              </span>
              
              {provider?.verificationStatus === 'approved' ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black inline-flex items-center gap-1">
                  <span>✓</span> Verified Provider
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black inline-flex items-center gap-1">
                  <span>⏳</span> {provider?.verificationStatus || 'Pending'}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {provider?.businessName || 'Campus Service Provider'} • {provider?.location || 'IIIT Bhopal Campus'}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsQuickUpdateOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">bolt</span>
              <span>+ Add / Update</span>
            </button>

            <button
              onClick={() => {
                fetchProviderInfo();
                fetchCounts();
                toast.success('Dashboard refreshed');
              }}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center justify-center"
              title="Refresh"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout with Desktop Sidebar & Mobile Bottom Nav */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* DESKTOP SIDEBAR NAVIGATION */}
          <aside className="hidden md:block md:col-span-1 space-y-2">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
                { id: 'services', label: 'Services / Products', icon: 'storefront', count: servicesCount },
                { id: 'customers', label: 'Customers', icon: 'group', count: customersCount },
                { id: 'notifications', label: 'Notifications', icon: 'notifications', badge: requestsCount > 0 ? requestsCount : null },
                { id: 'profile', label: 'Profile Settings', icon: 'settings' },
              ].map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === nav.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg">{nav.icon}</span>
                    <span>{nav.label}</span>
                  </div>

                  {nav.count !== undefined && nav.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      activeTab === nav.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {nav.count}
                    </span>
                  )}

                  {nav.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                      {nav.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* MAIN TAB CONTENT AREA */}
          <section className="md:col-span-3 space-y-6">
            
            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">ACTIVE SERVICES</span>
                    <div className="text-2xl font-black text-slate-900">{servicesCount}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Listings published</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">CUSTOMERS</span>
                    <div className="text-2xl font-black text-slate-900">{customersCount}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Students subscribed</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">STUDENT REQUESTS</span>
                    <div className="text-2xl font-black text-slate-900">{requestsCount}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Incoming requests</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">ACCOUNT STATUS</span>
                    <div className="text-sm font-black uppercase text-amber-700">{provider?.verificationStatus || 'Pending'}</div>
                    <span className="text-[10px] text-slate-500 font-medium">STUDTRADE verification</span>
                  </div>
                </div>

                {/* DYNAMIC DASHBOARD CONTENT BASED ON PROVIDER TYPES */}
                <div className="space-y-4">
                  <h3 className="font-black text-slate-900 text-base">Your Active Service Categories</h3>

                  {isMess && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🍱</span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">Today's Mess Menu</h4>
                            <p className="text-xs text-slate-500">Live menu displayed to students today</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsQuickUpdateOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer"
                        >
                          ✏️ Quick Edit Menu
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60 space-y-1">
                          <span className="text-[10px] font-extrabold text-amber-800 uppercase">BREAKFAST</span>
                          <p className="text-xs font-bold text-slate-900">{provider?.todayMenu?.breakfast || 'Not set'}</p>
                        </div>

                        <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60 space-y-1">
                          <span className="text-[10px] font-extrabold text-amber-800 uppercase">LUNCH</span>
                          <p className="text-xs font-bold text-slate-900">{provider?.todayMenu?.lunch || 'Not set'}</p>
                        </div>

                        <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60 space-y-1">
                          <span className="text-[10px] font-extrabold text-amber-800 uppercase">DINNER</span>
                          <p className="text-xs font-bold text-slate-900">{provider?.todayMenu?.dinner || 'Not set'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl">
                        <span>Type: <strong className="text-slate-800">{provider?.todayMenu?.vegNonVeg || 'Veg'}</strong></span>
                        <span>Serving Time: <strong className="text-slate-800">{provider?.todayMenu?.servingTime || '8 AM - 10 PM'}</strong></span>
                      </div>
                    </div>
                  )}

                  {isWater && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💧</span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">Water Camper Service</h4>
                            <p className="text-xs text-slate-500">20L Camper delivery & monthly subscriptions</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('services')}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all cursor-pointer"
                        >
                          Manage Pricing & Delivery
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        Publish your daily 20L camper rates and monthly delivery passes so students can request water delivery directly.
                      </p>
                    </div>
                  )}

                  {isRental && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏠</span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">Rental Items & Appliances</h4>
                            <p className="text-xs text-slate-500">Coolers, mattresses, furniture & hostel rentals</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('services');
                            setIsAddServiceModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all cursor-pointer"
                        >
                          + Add Rental Item
                        </button>
                      </div>
                    </div>
                  )}

                  {isShop && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🛍️</span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">Campus Shop & Products</h4>
                            <p className="text-xs text-slate-500">Stationery, snacks & student essentials</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('services');
                            setIsAddServiceModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                        >
                          + Add Product
                        </button>
                      </div>
                    </div>
                  )}

                  {isOther && !isMess && !isWater && !isRental && !isShop && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🛠️</span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">Student Services</h4>
                            <p className="text-xs text-slate-500">Laundry, printing, repair & transport</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('services')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          Manage Services
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* 2. SERVICES TAB */}
            {activeTab === 'services' && (
              <ProviderServicesTab
                provider={provider}
                isModalOpenInitially={isAddServiceModalOpen}
                onCloseInitialModal={() => setIsAddServiceModalOpen(false)}
              />
            )}

            {/* 3. CUSTOMERS TAB */}
            {activeTab === 'customers' && (
              <ProviderCustomersTab provider={provider} />
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <ProviderNotificationsTab provider={provider} />
            )}

            {/* 5. PROFILE TAB */}
            {activeTab === 'profile' && (
              <ProviderProfileTab provider={provider} onRefresh={fetchProviderInfo} />
            )}

          </section>
        </div>

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 flex items-center justify-around shadow-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
          { id: 'services', label: 'Services', icon: 'storefront' },
          { id: 'customers', label: 'Customers', icon: 'group' },
          { id: 'notifications', label: 'Notifs', icon: 'notifications' },
          { id: 'profile', label: 'Profile', icon: 'settings' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === item.id ? 'text-amber-600 font-black' : 'text-slate-400 font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>

      {/* QUICK UPDATE MODAL */}
      <QuickUpdateModal
        isOpen={isQuickUpdateOpen}
        onClose={() => setIsQuickUpdateOpen(false)}
        provider={provider}
        onRefresh={() => {
          fetchProviderInfo();
          fetchCounts();
        }}
        onOpenAddService={() => {
          setIsQuickUpdateOpen(false);
          setActiveTab('services');
          setIsAddServiceModalOpen(true);
        }}
      />

    </div>
  );
}
