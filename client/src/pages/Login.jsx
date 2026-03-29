import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/auth/login', formData);
            if (data.success) {
                login(data.token, data.user, '/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
            {/* Background blurs */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-container/5 rounded-full blur-[120px]" />
                <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto w-full">
                <div className="w-full max-w-lg">
                    <div className="bg-surface-container-lowest shadow-[0_40px_80px_rgba(0,102,103,0.06)] rounded-xl overflow-hidden border border-outline-variant/10">
                        <div className="p-8 sm:p-12">
                            {/* Brand */}
                            <div className="flex flex-col items-center mb-12">
                                <Link to="/" className="mb-0">
                                    <img src="/logo.png" alt="STUDTRADE" className="h-16 w-auto object-contain" />
                                </Link>
                                <h1 className="text-3xl font-extrabold text-primary tracking-tighter mb-2">Welcome back</h1>
                                <p className="text-on-surface-variant font-medium opacity-70">Access your student sanctuary</p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-semibold">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold tracking-wide text-primary ml-1 uppercase" htmlFor="email">
                                        College Email
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-[20px]">mail</span>
                                        </div>
                                        <input
                                            className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:bg-white transition-all duration-300 placeholder:text-outline/50 text-on-surface font-medium"
                                            id="email"
                                            name="email"
                                            placeholder="name@university.edu"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="block text-sm font-semibold tracking-wide text-primary uppercase" htmlFor="password">
                                            Password
                                        </label>
                                        <span className="text-xs font-bold text-primary-container hover:text-primary transition-colors cursor-pointer">
                                            Forgot?
                                        </span>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-[20px]">lock</span>
                                        </div>
                                        <input
                                            className="block w-full pl-11 pr-12 py-4 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:bg-white transition-all duration-300 placeholder:text-outline/50 text-on-surface font-medium"
                                            id="password"
                                            name="password"
                                            placeholder="••••••••"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="pt-4">
                                    <button
                                        className="w-full py-4 bg-primary-container text-on-primary-container font-bold text-lg rounded-full shadow-[0_10px_25px_rgba(26,128,129,0.2)] hover:shadow-[0_15px_35px_rgba(26,128,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Logging in...
                                            </span>
                                        ) : 'Log In'}
                                    </button>
                                </div>
                            </form>

                            {/* Divider + Sign Up */}
                            <div className="mt-10 flex flex-col items-center gap-6">
                                <div className="relative w-full flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-outline-variant/30" />
                                    </div>
                                    <span className="relative px-4 bg-surface-container-lowest text-xs font-bold text-outline/50 tracking-widest uppercase">
                                        Or join the community
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                                    <span>New to the trade?</span>
                                    <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all" to="/register">
                                        Sign Up
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer links */}
                    <div className="mt-12 flex justify-center gap-8 px-4 opacity-40">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-100 transition-opacity cursor-pointer">Privacy</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-100 transition-opacity cursor-pointer">Terms</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-100 transition-opacity cursor-pointer">Support</span>
                    </div>
                </div>
            </main>

            {/* Bottom accent */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-container to-secondary opacity-30" />
        </div>
    );
}
