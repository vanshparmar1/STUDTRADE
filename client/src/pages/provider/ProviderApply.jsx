import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LOGO = '/logo.png';

const PROVIDER_CATEGORIES = [
  { id: 'Mess / Tiffin', title: 'Mess / Tiffin', icon: '🍱', desc: 'Daily meal subscriptions, tiffin service, hostel mess' },
  { id: 'Water Camper', title: 'Water Camper', icon: '💧', desc: '20L water camper delivery & monthly subscriptions' },
  { id: 'Rental', title: 'Rental', icon: '🏠', desc: 'Hostel appliances, coolers, mattresses, furniture rentals' },
  { id: 'Shop', title: 'Shop', icon: '🛍', desc: 'Campus stationery, general store, snacks & groceries' },
  { id: 'Other Service', title: 'Other Service', icon: '🛠', desc: 'Laundry, transport, bike repair, printing & xerox' },
];

export default function ProviderApply() {
  const [step, setStep] = useState(1); // 1: Form, 2: Confirmation Submitted
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    password: '',
    location: '',
    description: '',
    providerTypes: ['Mess / Tiffin'],
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleCategory = (typeId) => {
    setFormData((prev) => {
      const exists = prev.providerTypes.includes(typeId);
      let updated;
      if (exists) {
        if (prev.providerTypes.length === 1) {
          toast.error('Please select at least one provider type.');
          return prev;
        }
        updated = prev.providerTypes.filter((t) => t !== typeId);
      } else {
        updated = [...prev.providerTypes, typeId];
      }
      return { ...prev, providerTypes: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.businessName || !formData.phone || !formData.email || !formData.password || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post('/provider/register', formData);

      if (data.success) {
        if (data.token && data.data?.user) {
          login(data.token, data.data.user, false);
        }
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between p-4 sm:p-6 font-sans">
      
      {/* Header */}
      <div className="max-w-xl w-full mx-auto pt-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO} alt="STUDTRADE" className="h-9 sm:h-11 w-auto" />
        </Link>
        <Link
          to="/provider"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200"
        >
          Provider Login
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-xl w-full mx-auto my-6">
        
        {step === 1 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            
            <div className="space-y-1">
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-black uppercase tracking-wider">
                PROVIDER APPLICATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-2">
                Apply as a Service Provider
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Join the STUDTRADE campus network. List your mess, water, rental, or campus shop for students.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Category Selector Cards (Multiple Select) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Provider Types (Multiple Allowed)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROVIDER_CATEGORIES.map((cat) => {
                    const isSelected = formData.providerTypes.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900">{cat.title}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">{cat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Business / Service Name *</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Sharma Student Mess"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address (Gmail, Yahoo, etc.) *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sharmamess@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Create Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Location / Campus Address *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Near IIIT Bhopal Main Gate, Hostel Block B"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Short Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell students about your mess timings, delivery area, or items available..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Submit Provider Application</span>
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  </>
                )}
              </button>

            </form>

          </div>
        ) : (
          
          /* Step 2: Application Submitted Confirmation Screen */
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              ⏳
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                Your application has been submitted.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
                STUDTRADE will verify your provider account before your services become publicly visible to students.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span className="material-symbols-outlined text-amber-500 text-base">info</span>
                <span>What happens next?</span>
              </div>
              <ul className="list-disc list-inside text-slate-500 space-y-1 font-medium">
                <li>You can access your Provider Dashboard right now to prepare your services.</li>
                <li>Your services will remain marked as <strong className="text-amber-700">Pending Verification</strong> until approved by Admin.</li>
                <li>Once approved, your listings will automatically appear on the STUDTRADE campus page.</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/provider/dashboard')}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Go to Provider Dashboard</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

        )}

      </div>

      <footer className="text-center text-xs font-medium text-slate-400 py-4">
        &copy; {new Date().getFullYear()} STUDTRADE Provider Ecosystem.
      </footer>

    </div>
  );
}
