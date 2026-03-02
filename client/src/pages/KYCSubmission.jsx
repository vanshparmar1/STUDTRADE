import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function KYCSubmission() {
    const { user, token, refreshUser } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Initial refresh to get latest status
    useEffect(() => {
        refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            return setMessage({ type: 'error', text: 'Please select an image to upload' });
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('document', file);

        try {
            const { data } = await axios.post('http://localhost:5000/api/kyc/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                setMessage({ type: 'success', text: 'KYC submitted successfully! Under review.' });
                setFile(null);
                setPreview(null);
                refreshUser(); // Update global state
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⏳', label: 'Under Review' },
        approved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅', label: 'Verified Account' },
        rejected: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: '❌', label: 'Verification Rejected' },
        none: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: '📄', label: 'Not Submitted' }
    };

    const status = user?.verificationStatus || 'none';
    const config = statusConfig[status];

    return (
        <main className="flex-grow bg-gray-50 p-6 flex items-start justify-center pb-20">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">Student Verification</h1>
                    <p className="mt-3 text-lg text-gray-600 font-medium">Get verified to start buying and selling on STUDTRADE.</p>
                </div>

                {/* Status Card */}
                <div className={`p-8 rounded-3xl border-2 shadow-sm ${config.color} transition-all duration-500`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="text-5xl flex-shrink-0">{config.icon}</div>
                        <div className="text-center md:text-left flex-grow">
                            <h2 className="text-2xl font-bold mb-1">{config.label}</h2>
                            <p className="font-medium opacity-90">
                                {status === 'approved' && `Verified as ${user.studtradeID}`}
                                {status === 'pending' && 'We are reviewing your document. This usually takes 24-48 hours.'}
                                {status === 'rejected' && 'Your document was rejected. Please upload a clear valid student ID.'}
                                {status === 'none' && 'Please upload your university ID card to unlock full marketplace access.'}
                            </p>
                        </div>
                        {status === 'approved' && user.studtradeID && (
                            <div className="bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl font-mono text-xl font-black border border-white/40 shadow-sm">
                                {user.studtradeID}
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Form (Hidden if approved or pending) */}
                {(status === 'none' || status === 'rejected') && (
                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-8">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900">Upload University ID</h3>
                            <p className="text-sm text-gray-500 mt-1">Accepts JPG, PNG, WEBP (Max 2MB)</p>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-2xl text-sm font-bold border transition-all ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="relative group block cursor-pointer">
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                <div className={`w-full aspect-video rounded-[2rem] border-4 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 ${preview ? 'border-indigo-400 bg-indigo-50/10' : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-gray-100'
                                    }`}>
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-2xl shadow-sm" />
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-indigo-600 mb-4 transition-transform group-hover:scale-110">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </div>
                                            <p className="font-bold text-gray-900">Click to select file</p>
                                            <p className="text-sm text-gray-500 mt-1">or drag and drop here</p>
                                        </>
                                    )}
                                </div>
                            </label>

                            {preview && (
                                <button
                                    type="button"
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    className="w-full py-3 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    Replace Image
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </div>
                            ) : 'Submit for Verification'}
                        </button>
                    </form>
                )}

                {status === 'pending' && (
                    <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-2 animate-pulse">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">Submission Received</h3>
                        <p className="text-gray-600 max-w-sm mx-auto font-medium">
                            Wait for our team to approve your ID. Once verified, you will be able to list items for sale.
                        </p>
                        <button
                            onClick={() => refreshUser()}
                            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-sm"
                        >
                            Check Status Again
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
