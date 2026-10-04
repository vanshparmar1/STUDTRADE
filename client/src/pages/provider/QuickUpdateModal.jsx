import React, { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function QuickUpdateModal({ isOpen, onClose, provider, onRefresh, onOpenAddService }) {
  const [activeAction, setActiveAction] = useState(null); // 'menu', 'price', 'notes'
  const [menuForm, setMenuForm] = useState({
    vegNonVeg: provider?.todayMenu?.vegNonVeg || 'Veg & Non-Veg',
    breakfast: provider?.todayMenu?.breakfast || '',
    lunch: provider?.todayMenu?.lunch || '',
    dinner: provider?.todayMenu?.dinner || '',
    servingTime: provider?.todayMenu?.servingTime || '8 AM - 10 PM',
  });
  const [quickNotes, setQuickNotes] = useState(provider?.quickNotes || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const providerTypes = provider?.providerTypes || [];
  const isMess = providerTypes.includes('Mess / Tiffin');
  const isWater = providerTypes.includes('Water Camper');
  const isRental = providerTypes.includes('Rental');
  const isShop = providerTypes.includes('Shop');

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await API.patch('/provider/quick-menu', {
        ...menuForm,
        quickNotes,
      });
      if (data.success) {
        toast.success("Today's menu / quick update published!");
        if (onRefresh) onRefresh();
        onClose();
      }
    } catch (err) {
      toast.error('Failed to update menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="text-lg font-black text-slate-900">Quick Update Actions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {!activeAction ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              Select what you want to update in seconds:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isMess && (
                <button
                  onClick={() => setActiveAction('menu')}
                  className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all cursor-pointer space-y-1"
                >
                  <div className="text-xl">🍱</div>
                  <div className="text-xs font-black text-amber-900">Update Today's Menu</div>
                  <div className="text-[11px] text-amber-700">Breakfast, Lunch, Dinner details</div>
                </button>
              )}

              <button
                onClick={onOpenAddService}
                className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="text-xl">🛍️</div>
                <div className="text-xs font-black text-blue-900">Add New Service / Product</div>
                <div className="text-[11px] text-blue-700">Create listing for students</div>
              </button>

              <button
                onClick={() => setActiveAction('notes')}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-all cursor-pointer space-y-1 sm:col-span-2"
              >
                <div className="text-xl">📢</div>
                <div className="text-xs font-black text-emerald-900">Update Announcement / Notice</div>
                <div className="text-[11px] text-emerald-700">Quick message shown on provider profile</div>
              </button>
            </div>
          </div>
        ) : activeAction === 'menu' ? (
          <form onSubmit={handleSaveMenu} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Veg / Non-Veg Type</label>
              <select
                value={menuForm.vegNonVeg}
                onChange={(e) => setMenuForm({ ...menuForm, vegNonVeg: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
              >
                <option value="Pure Veg">Pure Veg 🥬</option>
                <option value="Veg & Non-Veg">Veg & Non-Veg 🍗</option>
                <option value="Non-Veg Only">Non-Veg Only 🍖</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Today's Breakfast</label>
              <input
                type="text"
                value={menuForm.breakfast}
                onChange={(e) => setMenuForm({ ...menuForm, breakfast: e.target.value })}
                placeholder="e.g. Poha, Jalebi, Tea"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Today's Lunch</label>
              <input
                type="text"
                value={menuForm.lunch}
                onChange={(e) => setMenuForm({ ...menuForm, lunch: e.target.value })}
                placeholder="e.g. Dal Tadka, Jeera Rice, Roti, Aloo Gobi"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Today's Dinner</label>
              <input
                type="text"
                value={menuForm.dinner}
                onChange={(e) => setMenuForm({ ...menuForm, dinner: e.target.value })}
                placeholder="e.g. Matar Paneer, Rice, Roti, Kheer"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveAction(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold"
              >
                {loading ? 'Saving...' : 'Save & Publish Menu'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveMenu} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Quick Announcement / Note for Students</label>
              <textarea
                rows={3}
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder="e.g. Special Sunday Mess Feast today at 1 PM! Fresh cold 20L campers in stock."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveAction(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold"
              >
                {loading ? 'Saving...' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
