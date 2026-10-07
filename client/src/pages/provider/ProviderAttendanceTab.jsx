import React, { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProviderAttendanceTab({ provider, onNavigateToCustomers }) {
  // Date State — defaults to today YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Provider Type detection
  const providerTypes = provider?.providerTypes || [];
  const hasMess = providerTypes.includes('Mess / Tiffin') || providerTypes.length === 0;
  const hasWater = providerTypes.includes('Water Camper');

  // Service Type State: 'mess' | 'water'
  const [serviceType, setServiceType] = useState(() => (hasWater && !hasMess ? 'water' : 'mess'));

  // Meal Type State for Mess: 'lunch' | 'dinner'
  const [mealType, setMealType] = useState('lunch');

  // Data & Loading States
  const [customerList, setCustomerList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'marked_present' | 'marked_absent' | 'unmarked'

  // Confirmation Modal State for Bulk Absent
  const [isConfirmBulkAbsentOpen, setIsConfirmBulkAbsentOpen] = useState(false);

  // Fetch Attendance & Customers on filter change
  useEffect(() => {
    fetchData();
  }, [selectedDate, serviceType, mealType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const effectiveMealType = serviceType === 'water' ? 'water' : mealType;

      const [custRes, sumRes] = await Promise.all([
        API.get('/attendance/customers', {
          params: { dateStr: selectedDate, serviceType, mealType: effectiveMealType },
        }),
        API.get('/attendance/summary', {
          params: { dateStr: selectedDate },
        }),
      ]);

      if (custRes.data?.success) {
        setCustomerList(custRes.data.data || []);
      }
      if (sumRes.data?.success) {
        setSummary(sumRes.data.summary);
      }
    } catch (err) {
      console.warn('Error fetching attendance data:', err.message);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Single Customer Attendance Toggle
  const handleMarkAttendance = async (customerId, targetStatus) => {
    try {
      setSavingId(customerId);
      const effectiveMealType = serviceType === 'water' ? 'water' : mealType;

      // Optimistic UI update
      setCustomerList((prev) =>
        prev.map((c) => (c._id === customerId ? { ...c, attendanceStatus: targetStatus } : c))
      );

      const { data } = await API.post('/attendance', {
        customerId,
        dateStr: selectedDate,
        serviceType,
        mealType: effectiveMealType,
        status: targetStatus,
      });

      if (data.success) {
        toast.success(
          serviceType === 'water'
            ? `Marked as ${targetStatus === 'delivered' ? 'Delivered 💧' : 'Not Delivered ❌'}`
            : `Marked as ${targetStatus === 'present' ? 'Present ✅' : 'Absent ❌'}`
        );
        // Refresh summary background
        API.get('/attendance/summary', { params: { dateStr: selectedDate } })
          .then((res) => res.data?.success && setSummary(res.data.summary))
          .catch(() => {});
      }
    } catch (err) {
      toast.error('Failed to update attendance');
      fetchData(); // Revert on error
    } finally {
      setSavingId(null);
    }
  };

  // Bulk Attendance Handlers
  const handleBulkMark = async (targetStatus) => {
    try {
      setBulkLoading(true);
      const effectiveMealType = serviceType === 'water' ? 'water' : mealType;

      const { data } = await API.post('/attendance/bulk', {
        dateStr: selectedDate,
        serviceType,
        mealType: effectiveMealType,
        status: targetStatus,
      });

      if (data.success) {
        toast.success(
          `Marked all customers as ${
            targetStatus === 'present'
              ? 'Present ✅'
              : targetStatus === 'absent'
              ? 'Absent ❌'
              : targetStatus === 'delivered'
              ? 'Delivered 💧'
              : 'Not Delivered ❌'
          }!`
        );
        fetchData();
      }
    } catch (err) {
      toast.error('Bulk update failed');
    } finally {
      setBulkLoading(false);
      setIsConfirmBulkAbsentOpen(false);
    }
  };

  // Filtered Customer List
  const filteredCustomers = useMemo(() => {
    return customerList.filter((cust) => {
      const matchesSearch =
        (cust.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cust.contact || '').includes(searchQuery) ||
        (cust.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === 'all') return true;
      if (filterStatus === 'marked_present') return cust.attendanceStatus === 'present' || cust.attendanceStatus === 'delivered';
      if (filterStatus === 'marked_absent') return cust.attendanceStatus === 'absent' || cust.attendanceStatus === 'not_delivered';
      if (filterStatus === 'unmarked') return !cust.attendanceStatus;

      return true;
    });
  }, [customerList, searchQuery, filterStatus]);

  // Derived Counts
  const activeCount = customerList.length;
  const isWaterMode = serviceType === 'water';

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDateDisplay = (dateString) => {
    try {
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (_) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* ── 1. HEADER & DATE SELECTION CONTROL BAR ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider mb-1">
              <span>📋</span>
              <span>DAILY ATTENDANCE REGISTER</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Attendance Management
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Provider: <strong className="text-slate-800">{provider?.businessName || provider?.name || 'Service Provider'}</strong>
            </p>
          </div>

          {/* Service Type Switcher (Mess vs Water) */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 w-full sm:w-auto">
            <button
              onClick={() => setServiceType('mess')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                serviceType === 'mess'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🍱</span>
              <span>Mess / Food</span>
            </button>

            <button
              onClick={() => setServiceType('water')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                serviceType === 'water'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💧</span>
              <span>Water Camper</span>
            </button>
          </div>
        </div>

        {/* Date Navigator & Meal Selector Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          
          {/* Date Picker Navigator */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
            <button
              onClick={handlePrevDay}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Previous Day"
            >
              &lt; Prev
            </button>

            <div className="flex items-center gap-2 px-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-900 border-none outline-none cursor-pointer"
              />
              <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                ({formatDateDisplay(selectedDate)})
              </span>
            </div>

            <button
              onClick={handleNextDay}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Next Day"
            >
              Next &gt;
            </button>

            {!isToday && (
              <button
                onClick={handleToday}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-black transition-all cursor-pointer"
              >
                Today
              </button>
            )}
          </div>

          {/* Meal Toggle (Only for Mess / Food) */}
          {serviceType === 'mess' && (
            <div className="flex items-center gap-2 bg-amber-500/10 p-1.5 rounded-2xl border border-amber-300/60">
              <span className="text-xs font-black text-amber-900 px-2 uppercase tracking-wider">Meal:</span>
              <button
                onClick={() => setMealType('lunch')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  mealType === 'lunch'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100/50'
                }`}
              >
                <span>☀️</span>
                <span>Day / Lunch</span>
              </button>

              <button
                onClick={() => setMealType('dinner')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  mealType === 'dinner'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100/50'
                }`}
              >
                <span>🌙</span>
                <span>Night / Dinner</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {!isWaterMode ? (
          <>
            {/* Mess Lunch Metric */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <span>☀️</span> LUNCH ATTENDANCE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">
                  {summary?.mess?.lunch?.present || 0}
                </span>
                <span className="text-xs text-slate-400 font-extrabold">/ {activeCount} Present</span>
              </div>
              <span className="text-[10px] text-rose-600 font-bold block">
                {summary?.mess?.lunch?.absent || 0} Absent
              </span>
            </div>

            {/* Mess Dinner Metric */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <span>🌙</span> DINNER ATTENDANCE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-600">
                  {summary?.mess?.dinner?.present || 0}
                </span>
                <span className="text-xs text-slate-400 font-extrabold">/ {activeCount} Present</span>
              </div>
              <span className="text-[10px] text-rose-600 font-bold block">
                {summary?.mess?.dinner?.absent || 0} Absent
              </span>
            </div>
          </>
        ) : (
          /* Water Camper Metric */
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1 col-span-2">
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider flex items-center gap-1">
              <span>💧</span> WATER CAMPER DELIVERIES
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">
                {summary?.water?.delivered || 0}
              </span>
              <span className="text-xs text-slate-400 font-extrabold">/ {activeCount} Delivered</span>
            </div>
            <span className="text-[10px] text-rose-600 font-bold block">
              {summary?.water?.notDelivered || 0} Not Delivered
            </span>
          </div>
        )}

        {/* Total Customers */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TOTAL SUBSCRIBERS</span>
          <div className="text-2xl font-black text-slate-900">{activeCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Active customers</span>
        </div>

        {/* Date Display */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">REGISTER DATE</span>
          <div className="text-sm font-black text-slate-800">{selectedDate}</div>
          <span className="text-[10px] text-slate-500 font-medium">{isToday ? 'Today' : 'Historical record'}</span>
        </div>
      </div>

      {/* ── 3. BULK ACTIONS & SEARCH BAR ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search & Filter Inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search customer by name or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Customers ({customerList.length})</option>
            <option value="marked_present">
              {isWaterMode ? 'Delivered Only' : 'Present Only'}
            </option>
            <option value="marked_absent">
              {isWaterMode ? 'Not Delivered Only' : 'Absent Only'}
            </option>
            <option value="unmarked">Unmarked Only</option>
          </select>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBulkMark(isWaterMode ? 'delivered' : 'present')}
            disabled={bulkLoading || activeCount === 0}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">done_all</span>
            <span>{isWaterMode ? 'Mark All Delivered' : 'Mark All Present'}</span>
          </button>

          <button
            onClick={() => setIsConfirmBulkAbsentOpen(true)}
            disabled={bulkLoading || activeCount === 0}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
            <span>{isWaterMode ? 'Mark All Not Delivered' : 'Mark All Absent'}</span>
          </button>
        </div>
      </div>

      {/* ── 4. CUSTOMER ATTENDANCE LIST ── */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-400 font-bold text-xs">
          Loading attendance records...
        </div>
      ) : activeCount === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mx-auto">
            👥
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">No subscribers added yet</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              Add your mess or water service subscribers in the Customers tab to start marking daily attendance.
            </p>
          </div>
          {onNavigateToCustomers && (
            <button
              onClick={onNavigateToCustomers}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>+ Add Customers Now</span>
            </button>
          )}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center text-slate-500 font-medium text-xs">
          No customers match your search query or filter.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          {/* Table for Desktop */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-5">Customer / Student</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Subscribed Service</th>
                  <th className="py-3.5 px-5 text-center">Status ({isWaterMode ? 'Delivery' : mealType.toUpperCase()})</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => {
                  const isPresent = cust.attendanceStatus === 'present' || cust.attendanceStatus === 'delivered';
                  const isAbsent = cust.attendanceStatus === 'absent' || cust.attendanceStatus === 'not_delivered';
                  const isSaving = savingId === cust._id;

                  return (
                    <tr key={cust._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Customer Name */}
                      <td className="py-3.5 px-5 font-extrabold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
                            {cust.name ? cust.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <span className="block text-sm leading-tight">{cust.name}</span>
                            <span className="text-[10px] font-medium text-slate-400">{cust.status || 'Active Customer'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-5 font-bold text-slate-600">
                        {cust.contact || 'N/A'}
                      </td>

                      {/* Service Name */}
                      <td className="py-3.5 px-5 font-semibold text-slate-700">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                          {cust.serviceName || 'General Subscription'}
                        </span>
                      </td>

                      {/* Current Status Pill */}
                      <td className="py-3.5 px-5 text-center">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black">
                            <span>✓</span> {isWaterMode ? 'Delivered' : 'Present'}
                          </span>
                        ) : isAbsent ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-black">
                            <span>✕</span> {isWaterMode ? 'Not Delivered' : 'Absent'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-bold">
                            Unmarked
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleMarkAttendance(cust._id, isWaterMode ? 'delivered' : 'present')}
                            disabled={isSaving}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-emerald-50 text-emerald-700 border border-slate-200'
                            }`}
                          >
                            <span>✓</span>
                            <span>{isWaterMode ? 'Delivered' : 'Present'}</span>
                          </button>

                          <button
                            onClick={() => handleMarkAttendance(cust._id, isWaterMode ? 'not_delivered' : 'absent')}
                            disabled={isSaving}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200'
                            }`}
                          >
                            <span>✕</span>
                            <span>{isWaterMode ? 'Not Delivered' : 'Absent'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. CONFIRMATION MODAL FOR BULK ABSENT ── */}
      {isConfirmBulkAbsentOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="text-lg font-black text-slate-900">Confirm Bulk Update</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to mark <strong>ALL {filteredCustomers.length} active customers</strong> as{' '}
              <strong className="text-rose-600">{isWaterMode ? 'Not Delivered' : 'Absent'}</strong> for{' '}
              <strong>{selectedDate}</strong> ({serviceType === 'mess' ? mealType.toUpperCase() : 'WATER'})?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsConfirmBulkAbsentOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => handleBulkMark(isWaterMode ? 'not_delivered' : 'absent')}
                disabled={bulkLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
              >
                {bulkLoading ? 'Updating...' : 'Yes, Mark All Absent'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
