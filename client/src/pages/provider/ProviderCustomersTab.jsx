import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProviderCustomersTab({ provider }) {
  const [customers, setCustomers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('customers'); // 'customers' | 'requests'
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCust, setEditingCust] = useState(null);

  const [form, setForm] = useState({
    name: '',
    contact: '',
    serviceName: 'Monthly Mess',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchRequests();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/provider/customers');
      if (data.success) setCustomers(data.data);
    } catch (err) {
      console.warn('Failed to fetch customers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/provider/requests');
      if (data.success) setRequests(data.data);
    } catch (err) {
      console.warn('Failed to fetch requests:', err.message);
    }
  };

  const handleOpenAdd = () => {
    setEditingCust(null);
    setForm({
      name: '',
      contact: '',
      serviceName: provider?.providerTypes?.[0] || 'Monthly Service',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Active',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingCust(cust);
    setForm({
      name: cust.name,
      contact: cust.contact,
      serviceName: cust.serviceName || 'General Service',
      startDate: cust.startDate ? new Date(cust.startDate).toISOString().split('T')[0] : '',
      endDate: cust.endDate ? new Date(cust.endDate).toISOString().split('T')[0] : '',
      status: cust.status || 'Active',
      notes: cust.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) {
      toast.error('Customer name and contact number are required');
      return;
    }

    try {
      setFormLoading(true);
      if (editingCust) {
        const { data } = await API.put(`/provider/customers/${editingCust._id}`, form);
        if (data.success) {
          toast.success('Customer updated!');
          fetchCustomers();
          setIsAddModalOpen(false);
        }
      } else {
        const { data } = await API.post('/provider/customers', form);
        if (data.success) {
          toast.success('Customer added successfully!');
          fetchCustomers();
          setIsAddModalOpen(false);
        }
      }
    } catch (err) {
      toast.error('Failed to save customer');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAcceptRequest = async (reqId) => {
    try {
      const { data } = await API.patch(`/provider/requests/${reqId}/status`, { status: 'Accepted' });
      if (data.success) {
        toast.success('Student service request accepted! Customer added to your list.');
        fetchRequests();
        fetchCustomers();
      }
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (reqId) => {
    try {
      const { data } = await API.patch(`/provider/requests/${reqId}/status`, { status: 'Rejected' });
      if (data.success) {
        toast.success('Request rejected');
        fetchRequests();
      }
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  const handleDeleteCust = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;
    try {
      await API.delete(`/provider/customers/${id}`);
      toast.success('Customer record deleted');
      setCustomers(customers.filter((c) => c._id !== id));
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const cleanPhone = (p) => (p || '').replace(/\D/g, '');

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900">Customer Management</h2>
          <p className="text-xs text-slate-500 font-medium">
            Track student subscriptions, mess members & WhatsApp contacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSubTab('customers')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
            activeSubTab === 'customers'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          👥 Active Customers ({customers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
            activeSubTab === 'requests'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          📬 Student Requests ({requests.filter(r => r.status === 'Requested').length})
        </button>
      </div>

      {/* SUB-TAB 1: CUSTOMERS LIST */}
      {activeSubTab === 'customers' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200/90 text-center space-y-3">
              <div className="text-4xl">👥</div>
              <h3 className="font-extrabold text-slate-900 text-base">No Customers Added Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add students who subscribe to your mess, water camper, or rental service to keep track of start & expiry dates.
              </p>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-2xl bg-amber-500 text-white text-xs font-extrabold transition-all cursor-pointer"
              >
                + Add Customer Manually
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((cust) => (
                <div
                  key={cust._id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-3 shadow-xs hover:border-amber-400 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{cust.name}</h4>
                      <p className="text-xs text-amber-700 font-bold">{cust.serviceName}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      cust.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                      cust.status === 'Requested' ? 'bg-amber-100 text-amber-800' :
                      cust.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cust.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1.5 font-medium">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Phone / Contact:</span>
                      <span className="font-bold text-slate-900">{cust.contact}</span>
                    </div>

                    {cust.startDate && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Started:</span>
                        <span className="font-bold text-slate-900">
                          {new Date(cust.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}

                    {cust.endDate && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Expires:</span>
                        <span className="font-bold text-slate-900">
                          {new Date(cust.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}

                    {cust.notes && (
                      <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200/60 italic">
                        "{cust.notes}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/91${cleanPhone(cust.contact)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        💬 WhatsApp
                      </a>
                      <a
                        href={`tel:${cust.contact}`}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        📞
                      </a>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cust)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCust(cust._id)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: STUDENT REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200/90 text-center space-y-2">
              <div className="text-4xl">📬</div>
              <h3 className="font-extrabold text-slate-900 text-base">No Pending Service Requests</h3>
              <p className="text-xs text-slate-500">
                When students request your mess or service from the website, their requests appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base">{req.studentName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        req.status === 'Requested' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-amber-700">{req.serviceTitle}</p>
                    <p className="text-xs text-slate-500 font-medium">Contact: {req.studentContact} • {new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                    {req.message && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl italic">"{req.message}"</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <a
                      href={`https://wa.me/91${cleanPhone(req.studentContact)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none px-3 py-2 rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-xs text-center"
                    >
                      WhatsApp
                    </a>
                    {req.status === 'Requested' && (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req._id)}
                          className="p-2 rounded-2xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 font-bold text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingCust ? 'Edit Customer' : '+ Add Customer'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Student Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Selected Service</label>
                <input
                  type="text"
                  value={form.serviceName}
                  onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                  placeholder="e.g. Monthly Mess Plan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">End / Expiry Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="Active">Active 🟢</option>
                  <option value="Requested">Requested 🟡</option>
                  <option value="Completed">Completed 🔵</option>
                  <option value="Inactive">Inactive 🔴</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notes (Optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Paid via Cash on 1st Oct"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold cursor-pointer"
                >
                  {formLoading ? 'Saving...' : 'Save Customer'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
