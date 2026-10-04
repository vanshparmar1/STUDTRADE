import React, { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  'Mess / Tiffin',
  'Water Camper',
  'Rental',
  'Shop',
  'Other Service',
];

const compressImage = (file, maxDimension = 800, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function ProviderProfileTab({ provider, onRefresh }) {
  const [form, setForm] = useState({
    name: provider?.name || '',
    businessName: provider?.businessName || '',
    phone: provider?.phone || '',
    whatsapp: provider?.whatsapp || provider?.phone || '',
    email: provider?.email || '',
    location: provider?.location || '',
    description: provider?.description || '',
    openingHours: provider?.openingHours || '8:00 AM - 10:00 PM',
    profileImage: provider?.profileImage || '',
    providerTypes: provider?.providerTypes || ['Mess / Tiffin'],
  });

  const [loading, setLoading] = useState(false);

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Logo image size must be less than 10MB');
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      setForm((prev) => ({ ...prev, profileImage: compressedDataUrl }));
    } catch (err) {
      toast.error('Failed to process logo file');
    }
  };

  const toggleType = (t) => {
    setForm((prev) => {
      const exists = prev.providerTypes.includes(t);
      if (exists) {
        if (prev.providerTypes.length === 1) {
          toast.error('At least one provider type is required.');
          return prev;
        }
        return { ...prev, providerTypes: prev.providerTypes.filter((x) => x !== t) };
      }
      return { ...prev, providerTypes: [...prev.providerTypes, t] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await API.put('/provider/profile', form);
      if (data.success) {
        toast.success('Provider profile saved!');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const status = provider?.verificationStatus || 'pending';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Verification Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-black shrink-0">
            {provider?.businessName?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{provider?.businessName || 'Provider Profile'}</h3>
            <p className="text-xs text-slate-500">{provider?.name} • {provider?.phone}</p>
          </div>
        </div>

        <div>
          {status === 'approved' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
              <span>✓</span> Verified Provider
            </span>
          ) : status === 'pending' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300">
              <span>⏳</span> Pending Verification
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black border border-rose-300">
              <span>⛔</span> {status}
            </span>
          )}
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-black text-slate-900 text-lg">Provider Business Settings</h3>
          <p className="text-xs text-slate-500">Public information displayed to students on STUDTRADE.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Owner Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Business / Service Name *</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">WhatsApp Number</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Campus Location / Address *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Opening Hours</label>
              <input
                type="text"
                value={form.openingHours}
                onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                placeholder="e.g. 8:00 AM - 10:00 PM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
              />
            </div>

            {/* Profile Logo File Chooser */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Profile Logo / Image (Optional)</label>
              
              {form.profileImage ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={form.profileImage}
                      alt="Logo Preview"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Logo Selected</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">✓ Ready to update</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-all cursor-pointer">
                      Change File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, profileImage: '' })}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="sm:col-span-2 flex items-center justify-center gap-2 p-3 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50/80 hover:bg-amber-50/50 hover:border-amber-300 transition-all text-xs font-bold text-amber-700">
                    <span className="material-symbols-outlined text-lg">cloud_upload</span>
                    <span>Choose Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    value={form.profileImage}
                    onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                    placeholder="Or paste URL (https://...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-medium"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Business Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tell students about your mess, water delivery, or services offered..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
              />
            </div>
          </div>

          {/* Provider Types Multi-Select */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">Provider Category Types</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const active = form.providerTypes.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleType(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${
                      active
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {active ? '✓ ' : ''}{cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer"
            >
              {loading ? 'Saving Profile...' : 'Save Business Settings'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
