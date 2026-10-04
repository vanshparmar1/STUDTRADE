import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const WHATSAPP_NUMBER = '8058528664';

export const WEEKLY_MESS_MENU = [
  {
    id: 'monday',
    day: 'Monday',
    lunch: 'Roti + Dal Tadka + Aloo Gobi + Rice + Salad',
    dinner: 'Roti + Matar Paneer + Rice + Kheer'
  },
  {
    id: 'tuesday',
    day: 'Tuesday',
    lunch: 'Roti + Rajma Curry + Jeera Rice + Papad',
    dinner: 'Roti + Mix Veg + Dal Fry + Rice'
  },
  {
    id: 'wednesday',
    day: 'Wednesday',
    lunch: 'Roti + Chana Masala + Plain Rice + Salad',
    dinner: 'Roti + Chicken Curry (or Kadai Paneer) + Rice'
  },
  {
    id: 'thursday',
    day: 'Thursday',
    lunch: 'Roti + Kadi Pakoda + Veg Pulav + Salad',
    dinner: 'Roti + Aloo Baingan + Dal Fry + Rice'
  },
  {
    id: 'friday',
    day: 'Friday',
    lunch: 'Roti + Dal Makhani + Baingan Bharta + Rice',
    dinner: 'Roti + Egg Curry (or Paneer Butter Masala) + Rice'
  },
  {
    id: 'saturday',
    day: 'Saturday',
    lunch: 'Roti + Chole Masala + Rice + Boondi Raita',
    dinner: 'Roti + Sev Tamatar + Dal Rice + Halwa'
  },
  {
    id: 'sunday',
    day: 'Sunday',
    lunch: 'Special Veg Thali / Chicken Biryani + Raita',
    dinner: 'Roti + Dal Tadka + Jeera Rice + Gulab Jamun'
  }
];

const cleanPhone = (p) => (p || '').replace(/\D/g, '');

const CampusPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState('monday');

  const [providerServices, setProviderServices] = useState([]);
  const [approvedProviders, setApprovedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student Request Service Modal State
  const [requestProvider, setRequestProvider] = useState(null);
  const [requestServiceTitle, setRequestServiceTitle] = useState('');
  const [requestStudentName, setRequestStudentName] = useState('');
  const [requestStudentContact, setRequestStudentContact] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/services');
      if (data.success) {
        if (data.providerServices) setProviderServices(data.providerServices);
        if (data.approvedProviders) setApprovedProviders(data.approvedProviders);
      }
    } catch (err) {
      console.warn('API services fetch note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchServices();
  }, []);

  const handleOpenRequestModal = (prov, service = null) => {
    setRequestProvider(prov);
    setRequestServiceTitle(service?.title || prov.providerTypes?.[0] || 'Service Request');
    setRequestStudentName(user?.name || '');
    setRequestStudentContact(user?.phone || '');
    setRequestMessage('');
  };

  const handleSendServiceRequest = async (e) => {
    e.preventDefault();
    if (!requestStudentName.trim() || !requestStudentContact.trim()) {
      toast.error('Please enter your name and contact number');
      return;
    }

    try {
      setRequestLoading(true);
      const { data } = await API.post('/services/request', {
        providerId: requestProvider._id,
        studentName: requestStudentName,
        studentContact: requestStudentContact,
        serviceTitle: requestServiceTitle,
        message: requestMessage,
      });

      if (data.success) {
        toast.success(`Service request sent to ${requestProvider.businessName}! 🎉`);
        setRequestProvider(null);
      }
    } catch (err) {
      toast.error('Failed to send request');
    } finally {
      setRequestLoading(false);
    }
  };

  // Helper to filter provider services by category
  const getServicesByType = (type) => providerServices.filter((s) => s.type === type);
  const getProvidersByType = (type) => approvedProviders.filter((p) => p.providerTypes?.includes(type));

  const messServices = getServicesByType('Mess / Tiffin');
  const messProviders = getProvidersByType('Mess / Tiffin');

  const waterServices = getServicesByType('Water Camper');
  const waterProviders = getProvidersByType('Water Camper');

  const rentalServices = getServicesByType('Rental');
  const rentalProviders = getProvidersByType('Rental');

  const shopServices = getServicesByType('Shop');
  const shopProviders = getProvidersByType('Shop');

  const otherServices = getServicesByType('Other Service');
  const otherProviders = getProvidersByType('Other Service');

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col font-sans">
      <StitchNavbar activeLink="Services" />

      <main className="flex-1 pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
        
        {/* ── 1. SERVICES HERO ── */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 text-left shadow-xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--color-primary-container)]/30 text-[var(--color-primary)] text-xs font-extrabold uppercase tracking-wider">
            <span>🧰</span>
            <span>STUDENT SERVICES ECOSYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            CAMPUS SERVICES
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
            Useful verified services for everyday campus life. Subscribe to daily mess tiffins, order chilled 20L water campers, rent hostel coolers, or connect with verified campus shopkeepers.
          </p>
        </section>

        {/* ── SECTION 1: 🍱 MESS & TIFFIN SERVICES ── */}
        <section className="space-y-6 text-left">
          <div className="space-y-1 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍱</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">MESS & TIFFIN SERVICES</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Fresh daily veg & non-veg meal plans prepared by verified campus mess owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Render Uploaded Provider Services for Mess */}
            {messServices.map((svc) => {
              const prov = svc.provider || {};
              const price = svc.price || svc.pricingDetails?.monthlyPrice || 2100;
              return (
                <div key={svc._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    {svc.images?.[0] && (
                      <div className="h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
                        <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900">{svc.title}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                            ✓ Verified Provider
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">By <strong className="text-slate-800">{prov.businessName || prov.name || 'Mess Provider'}</strong> • 📍 {prov.location || 'Campus Gate'}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-amber-600">₹{price}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">/ month</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-extrabold text-amber-900">
                        <span>🍱 {svc.pricingDetails?.vegNonVeg || 'Veg'} Tiffin</span>
                        {svc.pricingDetails?.perMealPrice > 0 && <span>₹{svc.pricingDetails.perMealPrice} / meal</span>}
                      </div>
                      <p className="text-slate-600 font-medium">{svc.description || 'Fresh hygienic meals cooked daily.'}</p>
                      {prov.todayMenu?.lunch && (
                        <div className="text-slate-700 text-[11px] pt-1.5 border-t border-amber-200/60 font-medium">
                          <strong>Today's Menu:</strong> Lunch: {prov.todayMenu.lunch} | Dinner: {prov.todayMenu.dinner}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenRequestModal(prov, svc)}
                      className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">send</span>
                      <span>Request Service</span>
                    </button>
                    <a
                      href={`https://wa.me/91${cleanPhone(prov.whatsapp || prov.phone || WHATSAPP_NUMBER)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}

            {/* Fallback Display Approved Mess Providers if no explicit service item created yet */}
            {messServices.length === 0 && messProviders.map((prov) => (
              <div key={prov._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900">{prov.businessName}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                          ✓ Verified Provider
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{prov.name} • 📍 {prov.location}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold">
                      🟢 Accepting
                    </span>
                  </div>

                  {prov.todayMenu && (
                    <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-extrabold text-amber-900">
                        <span>🍱 TODAY'S MENU ({prov.todayMenu.vegNonVeg || 'Veg'})</span>
                        <span className="text-[10px] text-amber-700 font-normal">{prov.todayMenu.servingTime || ''}</span>
                      </div>
                      <div className="text-slate-700 font-medium space-y-0.5">
                        {prov.todayMenu.lunch && <div><strong>Lunch:</strong> {prov.todayMenu.lunch}</div>}
                        {prov.todayMenu.dinner && <div><strong>Dinner:</strong> {prov.todayMenu.dinner}</div>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenRequestModal(prov)}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Request Service</span>
                  </button>
                  <a
                    href={`https://wa.me/91${cleanPhone(prov.whatsapp || prov.phone || WHATSAPP_NUMBER)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            ))}

          </div>

          {/* WEEKLY MESS MENU ACCORDION / TABS */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 mt-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">WEEKLY MESS MENU SCHEDULE</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium">Standard day-wise meal schedule for hostel students</p>
              </div>
            </div>

            <div className="hidden md:block space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                {WEEKLY_MESS_MENU.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveDay(item.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeDay === item.id
                        ? 'bg-[var(--color-primary)] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.day}
                  </button>
                ))}
              </div>

              {WEEKLY_MESS_MENU.filter(m => m.id === activeDay).map((item) => (
                <div key={item.id} className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-emerald-50/70 border border-emerald-200/70 p-4 rounded-2xl space-y-1">
                    <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">🍛 Lunch</span>
                    <p className="text-xs font-bold text-slate-800">{item.lunch}</p>
                  </div>
                  <div className="bg-blue-50/70 border border-blue-200/70 p-4 rounded-2xl space-y-1">
                    <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">🍽️ Dinner</span>
                    <p className="text-xs font-bold text-slate-800">{item.dinner}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:hidden space-y-3">
              {WEEKLY_MESS_MENU.map((item) => (
                <div key={item.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                  <div className="font-black text-xs text-slate-900 border-b border-slate-200/60 pb-1 flex justify-between">
                    <span>{item.day.toUpperCase()}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div><span className="font-extrabold text-emerald-800">🍛 Lunch: </span><span className="text-slate-700 font-medium">{item.lunch}</span></div>
                    <div><span className="font-extrabold text-blue-800">🍽️ Dinner: </span><span className="text-slate-700 font-medium">{item.dinner}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 2: 💧 WATER CAMPER SERVICES ── */}
        <section className="space-y-6 text-left pt-4">
          <div className="space-y-1 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💧</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">WATER CAMPER SERVICES</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              20L Chilled RO mineral water camper delivery to your hostel floor or room doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {waterServices.map((svc) => {
              const prov = svc.provider || {};
              const daily = svc.price || svc.pricingDetails?.dailyPrice || 30;
              const monthly = svc.pricingDetails?.monthlyPrice || 600;
              return (
                <div key={svc._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4 hover:border-blue-400 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    {svc.images?.[0] ? (
                      <div className="h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
                        <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-40 w-full rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-center text-4xl">
                        💧
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900">{svc.title}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                            ✓ Verified Provider
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">By <strong className="text-slate-800">{prov.businessName || prov.name || 'Water Provider'}</strong> • 📍 {prov.location || 'Campus Gate'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-left space-y-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Daily Service</span>
                        <div className="text-base font-black text-slate-900">₹{daily} / day</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-left space-y-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Monthly Pass</span>
                        <div className="text-base font-black text-slate-900">₹{monthly} / month</div>
                      </div>
                    </div>

                    {svc.pricingDetails?.deliveryInfo && (
                      <p className="text-xs font-bold text-blue-800 bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                        🚚 {svc.pricingDetails.deliveryInfo}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenRequestModal(prov, svc)}
                      className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">send</span>
                      <span>Request Water Delivery</span>
                    </button>
                    <a
                      href={`https://wa.me/91${cleanPhone(prov.whatsapp || prov.phone || WHATSAPP_NUMBER)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}

            {/* Fallback Display Approved Water Providers */}
            {waterServices.length === 0 && waterProviders.map((prov) => (
              <div key={prov._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4 hover:border-blue-400 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900">{prov.businessName}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                          ✓ Verified Provider
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{prov.name} • 📍 {prov.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-left space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">20L Camper</span>
                      <div className="text-base font-black text-slate-900">₹30 - ₹40 / day</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-left space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Monthly Pass</span>
                      <div className="text-base font-black text-slate-900">₹600 / month</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenRequestModal(prov)}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Request Water Delivery</span>
                  </button>
                  <a
                    href={`https://wa.me/91${cleanPhone(prov.whatsapp || prov.phone || WHATSAPP_NUMBER)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* ── SECTION 3: 🏠 HOSTEL RENTAL SERVICES ── */}
        <section className="space-y-6 text-left pt-4">
          <div className="space-y-1 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">HOSTEL RENTAL SERVICES</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Hostel coolers, mattresses, study tables, chairs & appliances available for monthly or semester rental.
            </p>
          </div>

          {rentalServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rentalServices.map((svc) => {
                const prov = svc.provider || {};
                return (
                  <div key={svc._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4 hover:border-purple-400 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      {svc.images?.[0] && (
                        <div className="h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
                          <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900">{svc.title}</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                              ✓ Verified Provider
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">By <strong className="text-slate-800">{prov.businessName || prov.name || 'Rental Partner'}</strong> • 📍 {prov.location || 'Campus Gate'}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-purple-600">₹{svc.price}</span>
                          <span className="text-[10px] text-slate-400 font-bold block">{svc.pricingDetails?.duration || '/ month'}</span>
                        </div>
                      </div>

                      <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between font-extrabold text-purple-900">
                          <span>Item Condition: {svc.pricingDetails?.condition || 'Good'}</span>
                          <span>{svc.availability}</span>
                        </div>
                        {svc.description && <p className="text-slate-600 font-medium">{svc.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenRequestModal(prov, svc)}
                        className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                        <span>Request Rental</span>
                      </button>
                      <a
                        href={`https://wa.me/91${cleanPhone(prov.whatsapp || prov.phone || WHATSAPP_NUMBER)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
              <div className="text-4xl">🏠</div>
              <h3 className="text-lg font-extrabold text-slate-900">Verified Rental Services</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Verified hostel coolers, study tables, mattresses & cycle rentals provided by campus partners. Contact verified providers or submit a request directly.
              </p>
            </div>
          )}
        </section>

        {/* ── SECTION 4: 🛍️ CAMPUS SHOP & GROCERIES ── */}
        <section className="space-y-6 text-left pt-4">
          <div className="space-y-1 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">CAMPUS SHOPS & GROCERIES</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Stationery, snacks, hostel groceries & products from verified campus shopkeepers.
            </p>
          </div>

          {shopServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shopServices.map((svc) => {
                const prov = svc.provider || {};
                return (
                  <div key={svc._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4 hover:border-slate-400 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      {svc.images?.[0] && (
                        <div className="h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
                          <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900">{svc.title}</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                              ✓ Verified Provider
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">Shop: <strong className="text-slate-800">{prov.businessName || prov.name || 'Campus Shop'}</strong> • 📍 {prov.location || 'Campus'}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-slate-900">₹{svc.price}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                        <div className="font-extrabold text-slate-800">Status: {svc.availability || 'Available'}</div>
                        {svc.description && <p className="text-slate-600 font-medium">{svc.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenRequestModal(prov, svc)}
                        className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                        <span>Order / Request</span>
                      </button>
                      <a
                        href={`https://wa.me/91${cleanPhone(prov.whatsapp || prov.phone || WHATSAPP_NUMBER)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
              <div className="text-4xl">🛍️</div>
              <h3 className="text-lg font-extrabold text-slate-900">Campus Shop Partners</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Verified campus stationery, xerox, snacks, and hostel general stores.
              </p>
            </div>
          )}
        </section>

        {/* ── SECTION 5: 🛠️ OTHER CAMPUS SERVICES ── */}
        <section className="space-y-6 text-left pt-4">
          <div className="space-y-1 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛠️</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">OTHER STUDENT SERVICES</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Hostel laundry, bike/cycle repair, printing & xerox, transport & academic support.
            </p>
          </div>

          {otherServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherServices.map((svc) => {
                const prov = svc.provider || {};
                return (
                  <div key={svc._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4 hover:border-slate-400 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900">{svc.title}</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                              ✓ Verified Provider
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">By <strong className="text-slate-800">{prov.businessName || prov.name || 'Campus Partner'}</strong> • 📍 {prov.location || 'Campus Gate'}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-slate-900">₹{svc.price}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                        <div className="font-extrabold text-slate-800">Status: {svc.availability || 'Available'}</div>
                        {svc.description && <p className="text-slate-600 font-medium">{svc.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenRequestModal(prov, svc)}
                        className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                        <span>Request Service</span>
                      </button>
                      <a
                        href={`https://wa.me/91${cleanPhone(prov.whatsapp || prov.phone || WHATSAPP_NUMBER)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
              <div className="text-4xl">🛠️</div>
              <h3 className="text-lg font-extrabold text-slate-900">Campus Service Partners</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Laundry, bike repair, transport, printing & student support services.
              </p>
            </div>
          )}
        </section>

        {/* ── Student Request Service Modal ── */}
        {requestProvider && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Request Service</h3>
                  <p className="text-xs text-amber-700 font-bold">{requestProvider.businessName}</p>
                </div>
                <button
                  onClick={() => setRequestProvider(null)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSendServiceRequest} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                  <input
                    type="text"
                    value={requestStudentName}
                    onChange={(e) => setRequestStudentName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    value={requestStudentContact}
                    onChange={(e) => setRequestStudentContact(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Service Requested</label>
                  <input
                    type="text"
                    value={requestServiceTitle}
                    onChange={(e) => setRequestServiceTitle(e.target.value)}
                    placeholder="e.g. Monthly Veg Mess / 20L Water Camper"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Message / Note for Provider</label>
                  <textarea
                    rows={2}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="e.g. Interested in starting mess subscription from 1st of next month..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRequestProvider(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold cursor-pointer"
                  >
                    {requestLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <StitchFooter />
    </div>
  );
};

export default CampusPage;
