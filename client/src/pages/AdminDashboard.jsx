import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('studtrade_token');
            const { data } = await API.get(`/admin/reports?status=${statusFilter}`);
            if (data.success) {
                setReports(data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, status) => {
        try {
            const adminNote = window.prompt(`Add a note for this ${status} report (optional):`);

            const { data } = await API.patch(`/admin/reports/${id}/review`, { status, actionTaken: adminNote });

            if (data.success) {
                setReports(reports.map(r => r._id === id ? data.data : r));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update report');
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-600 font-bold">Loading Reports...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-500 font-bold">Review flagged content from the community</p>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-700 outline-none focus:border-indigo-600 transition-all"
                >
                    <option value="">All Reports</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="dismissed">Dismissed</option>
                </select>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-100">
                    Error: {error}
                </div>
            )}

            {reports.length === 0 ? (
                <div className="bg-gray-50 rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200">
                    <p className="text-4xl mb-4">🙌</p>
                    <h2 className="text-2xl font-black text-gray-400 uppercase tracking-widest">No reports found</h2>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reports.map((report) => (
                        <div key={report._id} className="bg-white border-2 border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-48 h-48 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                                    {report.item?.images?.[0] ? (
                                        <img src={report.item.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-black">NO IMAGE</div>
                                    )}
                                </div>

                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${report.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                report.status === 'reviewed' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                {report.status}
                                            </span>
                                            <h3 className="text-2xl font-black text-gray-900 mt-3 truncate max-w-md">{report.item?.title || 'Unknown Item'}</h3>
                                            <p className="text-sm text-gray-400 font-bold mt-1">Reported by: {report.reportedBy?.name} ({report.reportedBy?.email})</p>
                                        </div>
                                        <div className="text-right text-xs text-gray-400 font-bold uppercase tracking-widest">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl italic text-red-900 font-medium mb-6">
                                        "{report.reason}"
                                    </div>

                                    {report.adminNote && (
                                        <div className="bg-gray-50 p-4 rounded-xl text-sm font-bold text-gray-600 mb-6 border border-gray-100">
                                            Admin Note: {report.adminNote}
                                        </div>
                                    )}

                                    {report.status === 'pending' && (
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleReview(report._id, 'reviewed')}
                                                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all active:scale-95"
                                            >
                                                Mark as Reviewed
                                            </button>
                                            <button
                                                onClick={() => handleReview(report._id, 'dismissed')}
                                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-black hover:bg-gray-200 transition-all active:scale-95"
                                            >
                                                Dismiss Report
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
    );
}
