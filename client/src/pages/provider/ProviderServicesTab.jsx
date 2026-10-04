import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const compressImage = (file, maxDimension = 1000, quality = 0.75) => {
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

export default function ProviderServicesTab({ provider, isModalOpenInitially = false, onCloseInitialModal }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(isModalOpenInitially);
  const [editingService, setEditingService] = useState(null);

  const providerTypes = provider?.providerTypes || ['Other Service'];

  const [form, setForm] = useState({
    type: providerTypes[0] || 'Mess / Tiffin',
    title: '',
    description: '',
    price: 0,
    availability: 'Available',
    schedule: '',
    imageUrl: '',
    pricingDetails: {
      dailyPrice: 0,
      monthlyPrice: 0,
      perMealPrice: 0,
      vegNonVeg: 'Veg',
      breakfast: '',
      lunch: '',
      dinner: '',
      servingTime: '',
      duration: 'Per Month',
      condition: 'Good',
      deliveryInfo: '',
    },
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      setForm((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
    } catch (err) {
      toast.error('Failed to process image file');
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (isModalOpenInitially) setIsModalOpen(true);
  }, [isModalOpenInitially]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/provider/services');
      if (data.success) setServices(data.data);
    } catch (err) {
      console.warn('Failed to load services:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setForm({
      type: providerTypes[0] || 'Mess / Tiffin',
      title: '',
      description: '',
      price: 0,
      availability: 'Available',
      schedule: '',
      imageUrl: '',
      pricingDetails: {
        dailyPrice: 0,
        monthlyPrice: 0,
        perMealPrice: 0,
        vegNonVeg: 'Veg',
        breakfast: '',
        lunch: '',
        dinner: '',
        servingTime: '8 AM - 10 PM',
        duration: 'Per Month',
        condition: 'Good',
        deliveryInfo: 'Free Hostel Delivery',
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setForm({
      type: svc.type,
      title: svc.title,
      description: svc.description || '',
      price: svc.price || 0,
      availability: svc.availability || 'Available',
      schedule: svc.schedule || '',
      imageUrl: svc.images?.[0] || '',
      pricingDetails: {
        dailyPrice: svc.pricingDetails?.dailyPrice || 0,
        monthlyPrice: svc.pricingDetails?.monthlyPrice || 0,
        perMealPrice: svc.pricingDetails?.perMealPrice || 0,
        vegNonVeg: svc.pricingDetails?.vegNonVeg || 'Veg',
        breakfast: svc.pricingDetails?.breakfast || '',
        lunch: svc.pricingDetails?.lunch || '',
        dinner: svc.pricingDetails?.dinner || '',
        servingTime: svc.pricingDetails?.servingTime || '',
        duration: svc.pricingDetails?.duration || 'Per Month',
        condition: svc.pricingDetails?.condition || 'Good',
        deliveryInfo: svc.pricingDetails?.deliveryInfo || '',
      },
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (provider?.verificationStatus !== 'approved') {
      toast.error('Your provider account is currently pending verification by STUDTRADE admin. You can publish services after your application is approved.');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        type: form.type,
        title: form.title,
        description: form.description,
        price: Number(form.price) || 0,
        availability: form.availability,
        schedule: form.schedule,
        images: form.imageUrl ? [form.imageUrl] : [],
        pricingDetails: form.pricingDetails,
      };

      if (editingService) {
        const { data } = await API.put(`/provider/services/${editingService._id}`, payload);
        if (data.success) {
          toast.success('Service updated successfully!');
          fetchServices();
          setIsModalOpen(false);
        }
      } else {
        const { data } = await API.post('/provider/services', payload);
        if (data.success) {
          toast.success('Service/Product published successfully!');
          fetchServices();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setFormLoading(false);
      if (onCloseInitialModal) onCloseInitialModal();
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await API.patch(`/provider/services/${id}/status`);
      if (data.success) {
        toast.success(data.message);
        setServices(services.map((s) => (s._id === id ? data.data : s)));
      }
    } catch (err) {
      toast.error('Failed to update service status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await API.delete(`/provider/services/${id}`);
      toast.success('Service deleted');
      setServices(services.filter((s) => s._id !== id));
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900">Services & Products</h2>
          <p className="text-xs text-slate-500 font-medium">
            Manage your active offerings published on STUDTRADE.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          <span>+ Add Service / Product</span>
        </button>
      </div>

      {/* Services List Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-400">Loading your services...</div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/90 text-center space-y-3">
          <div className="text-4xl">🛍️</div>
          <h3 className="font-extrabold text-slate-900 text-base">No Services or Products Listed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click '+ Add Service / Product' to create your mess pricing, water camper rates, or rental listings.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div
              key={svc._id}
              className={`bg-white rounded-3xl border transition-all p-5 space-y-4 shadow-xs ${
                svc.status === 'hidden' ? 'opacity-60 border-slate-200 bg-slate-50/50' : 'border-slate-200 hover:border-amber-400'
              }`}
            >
              {/* Image & Type Badge */}
              <div className="relative h-40 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
                {svc.images?.[0] ? (
                  <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">
                    {svc.type === 'Mess / Tiffin' ? '🍱' : svc.type === 'Water Camper' ? '💧' : svc.type === 'Rental' ? '🏠' : svc.type === 'Shop' ? '🛍️' : '🛠️'}
                  </span>
                )}
                
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase">
                  {svc.type}
                </span>

                <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  svc.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {svc.status === 'active' ? 'Public' : 'Hidden'}
                </span>
              </div>

              {/* Title & Price */}
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">{svc.title}</h3>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-amber-600">
                      ₹{svc.price || svc.pricingDetails?.monthlyPrice || svc.pricingDetails?.dailyPrice || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {svc.pricingDetails?.duration || 'price'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{svc.description || 'No description provided.'}</p>
              </div>

              {/* Status details */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <span className="font-bold">Availability:</span>
                <span className="font-black text-slate-800">{svc.availability}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                <button
                  onClick={() => handleToggleStatus(svc._id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  {svc.status === 'active' ? '👁️ Hide' : '👁️ Show'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-all cursor-pointer"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(svc._id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* DYNAMIC SERVICE FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingService ? 'Edit Service / Product' : '+ Add New Service / Product'}
                </h3>
                <p className="text-xs text-slate-500">Short, simple listing details for students.</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseInitialModal) onCloseInitialModal();
                }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  {providerTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="Mess / Tiffin">Mess / Tiffin</option>
                  <option value="Water Camper">Water Camper</option>
                  <option value="Rental">Rental</option>
                  <option value="Shop">Shop</option>
                  <option value="Other Service">Other Service</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Title / Service Name *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={
                    form.type === 'Mess / Tiffin' ? 'e.g. Monthly Mess & Tiffin Service' :
                    form.type === 'Water Camper' ? 'e.g. 20L Cold Water Camper Service' :
                    form.type === 'Rental' ? 'e.g. Symphony Cooler 45L Rental' : 'e.g. Service Title'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                  required
                />
              </div>

              {/* DYNAMIC FIELDS ACCORDING TO CATEGORY TYPE */}
              {form.type === 'Mess / Tiffin' && (
                <div className="grid grid-cols-2 gap-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900">Veg / Non-Veg</label>
                    <select
                      value={form.pricingDetails.vegNonVeg}
                      onChange={(e) => setForm({
                        ...form,
                        pricingDetails: { ...form.pricingDetails, vegNonVeg: e.target.value }
                      })}
                      className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs font-medium"
                    >
                      <option value="Veg">Pure Veg 🥬</option>
                      <option value="Veg & Non-Veg">Veg & Non-Veg 🍗</option>
                      <option value="Non-Veg">Non-Veg 🍖</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900">Monthly Price (₹)</label>
                    <input
                      type="number"
                      value={form.price || form.pricingDetails.monthlyPrice}
                      onChange={(e) => setForm({
                        ...form,
                        price: Number(e.target.value),
                        pricingDetails: { ...form.pricingDetails, monthlyPrice: Number(e.target.value) }
                      })}
                      placeholder="e.g. 3000"
                      className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900">Per Meal Price (₹)</label>
                    <input
                      type="number"
                      value={form.pricingDetails.perMealPrice}
                      onChange={(e) => setForm({
                        ...form,
                        pricingDetails: { ...form.pricingDetails, perMealPrice: Number(e.target.value) }
                      })}
                      placeholder="e.g. 70"
                      className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900">Serving / Timings</label>
                    <input
                      type="text"
                      value={form.pricingDetails.servingTime}
                      onChange={(e) => setForm({
                        ...form,
                        pricingDetails: { ...form.pricingDetails, servingTime: e.target.value }
                      })}
                      placeholder="e.g. Lunch 12-3 PM, Dinner 8-10 PM"
                      className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {form.type === 'Water Camper' && (
                <div className="grid grid-cols-2 gap-3 bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200/80">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-900">Daily / Per Camper Price (₹)</label>
                    <input
                      type="number"
                      value={form.price || form.pricingDetails.dailyPrice}
                      onChange={(e) => setForm({
                        ...form,
                        price: Number(e.target.value),
                        pricingDetails: { ...form.pricingDetails, dailyPrice: Number(e.target.value) }
                      })}
                      placeholder="e.g. 30"
                      className="w-full bg-white border border-blue-200 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-900">Monthly Pass Price (₹)</label>
                    <input
                      type="number"
                      value={form.pricingDetails.monthlyPrice}
                      onChange={(e) => setForm({
                        ...form,
                        pricingDetails: { ...form.pricingDetails, monthlyPrice: Number(e.target.value) }
                      })}
                      placeholder="e.g. 600"
                      className="w-full bg-white border border-blue-200 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-blue-900">Delivery / Collection Details</label>
                    <input
                      type="text"
                      value={form.pricingDetails.deliveryInfo}
                      onChange={(e) => setForm({
                        ...form,
                        pricingDetails: { ...form.pricingDetails, deliveryInfo: e.target.value }
                      })}
                      placeholder="e.g. Free delivery to Hostel Rooms A & B every morning 7 AM"
                      className="w-full bg-white border border-blue-200 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {form.type === 'Rental' && (
                <div className="grid grid-cols-2 gap-3 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200/80">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-900">Rental Price (₹)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="e.g. 500"
                      className="w-full bg-white border border-purple-200 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-900">Rental Duration</label>
                    <select
                      value={form.pricingDetails.duration}
                      onChange={(e) => setForm({
                        ...form,
                        pricingDetails: { ...form.pricingDetails, duration: e.target.value }
                      })}
                      className="w-full bg-white border border-purple-200 rounded-xl p-2 text-xs font-medium"
                    >
                      <option value="Per Month">Per Month</option>
                      <option value="Per Semester">Per Semester</option>
                      <option value="Per Day">Per Day</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-purple-900">Item Condition</label>
                    <input
                      type="text"
                      value={form.pricingDetails.condition}
                      onChange={(e) => setForm({
                        ...form,
                        pricingDetails: { ...form.pricingDetails, condition: e.target.value }
                      })}
                      placeholder="e.g. Excellent / Like New"
                      className="w-full bg-white border border-purple-200 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {(form.type === 'Shop' || form.type === 'Other Service') && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Price (₹)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="e.g. 150"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Availability Status</label>
                    <select
                      value={form.availability}
                      onChange={(e) => setForm({ ...form, availability: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium"
                    >
                      <option value="Available">Available 🟢</option>
                      <option value="Accepting Customers">Accepting Customers 🟢</option>
                      <option value="Out of Stock">Out of Stock 🔴</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details about quality, items included, or service schedule..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                />
              </div>

              {/* Photo / Image File Chooser */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Photo / Image (Optional)</label>
                
                {form.imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Image Selected</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">✓ Ready to save</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-all cursor-pointer">
                        Change File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50/80 hover:bg-amber-50/50 hover:border-amber-300 transition-all">
                      <div className="flex flex-col items-center justify-center pt-3 pb-3">
                        <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">cloud_upload</span>
                        <p className="text-xs font-semibold text-slate-700">
                          <span className="font-extrabold text-amber-600">Choose Image File</span> or drop here
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    <div className="pt-0.5">
                      <input
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-2 text-[11px] text-slate-600 font-medium placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseInitialModal) onCloseInitialModal();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold cursor-pointer"
                >
                  {formLoading ? 'Saving...' : editingService ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
