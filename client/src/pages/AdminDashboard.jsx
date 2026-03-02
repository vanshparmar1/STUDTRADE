import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // stores userId being processed

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('http://localhost:5000/api/admin/pending-users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch pending users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAction = async (userId, action) => {
        try {
            setActionLoading(userId);
            await axios.patch(
                `http://localhost:5000/api/admin/${action}/${userId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Remove the user from the list on success
            setUsers((prev) => prev.filter((user) => user._id !== userId));
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} user`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <main className="flex-grow bg-gray-50 flex items-start justify-center p-6 pb-20">
            <div className="w-full max-w-5xl space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Review and verify pending student KYC submissions.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                {users.length === 0 && !error ? (
                    <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
                        <p className="mt-1 text-sm text-gray-500">There are no pending KYC verifications right now.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {users.map((user) => (
                            <div key={user._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
                                {/* Image Preview */}
                                <div className="h-48 bg-gray-100 relative group">
                                    {user.kycDocument ? (
                                        <a href={user.kycDocument} target="_blank" rel="noreferrer" className="block w-full h-full">
                                            <img
                                                src={user.kycDocument}
                                                alt="KYC Document"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-sm font-medium flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>
                                                    View Full Size
                                                </span>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Document
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="p-5 flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate" title={user.name}>{user.name}</h3>
                                    <p className="text-sm text-gray-500 truncate mt-1" title={user.email}>{user.email}</p>
                                    <div className="mt-3 text-xs font-medium text-gray-400">
                                        Submitted {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleAction(user._id, 'reject')}
                                        disabled={actionLoading === user._id}
                                        className="py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(user._id, 'verify')}
                                        disabled={actionLoading === user._id}
                                        className="py-2.5 px-4 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm hover:shadow focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {actionLoading === user._id ? (
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : (
                                            'Approve'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
