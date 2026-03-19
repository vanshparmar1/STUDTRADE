import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── Client-side validation ─────────────────────────────────────────────── */
function validate(form) {
    const errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!form.email.toLowerCase().endsWith('@iiitbhopal.ac.in')) errors.email = 'Only @iiitbhopal.ac.in email addresses are allowed.';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    return errors;
}

export default function Register() {
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setForm((prev) => ({ ...prev, [id]: value }));
        if (fieldErrors[id]) setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        const errors = validate(form);
        if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

        try {
            setLoading(true);
            const { data } = await API.post('/auth/register', {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim() || undefined,
                password: form.password,
            });
            login(data.token, data.user, '/');
        } catch (err) {
            setServerError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Helper to render a form field ──────────────────────────────────── */
    const renderField = (id, label, icon, placeholder, type = 'text', optional = false) => {
        const inputType = (id === 'password' || id === 'confirmPassword') && showPasswords ? 'text' : type;
        return (
            <div className="space-y-2" key={id}>
                <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor={id}>
                    {label}
                    {optional && <span className="text-outline font-normal ml-1">(Optional)</span>}
                </label>
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                        {icon}
                    </span>
                    <input
                        className={`w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary-container/20 transition-all placeholder:text-outline/50 font-medium ${
                            fieldErrors[id] ? 'ring-2 ring-error/40 bg-error-container/10' : ''
                        }`}
                        id={id}
                        placeholder={placeholder}
                        type={inputType}
                        value={form[id]}
                        onChange={handleChange}
                        autoComplete={type === 'password' ? 'new-password' : id}
                    />
                </div>
                {fieldErrors[id] && <p className="text-xs font-medium text-error ml-1">{fieldErrors[id]}</p>}
            </div>
        );
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6 selection:bg-primary-fixed selection:text-on-primary-fixed">
            {/* Background blurs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 blur-[120px] -z-10 rounded-full" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-primary/5 blur-[100px] -z-10 rounded-full" />

            <main className="w-full max-w-xl">
                <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_50px_rgba(26,128,129,0.06)] overflow-hidden">
                    <div className="p-10 md:p-16">
                        {/* Brand */}
                        <div className="flex flex-col items-center mb-12">
                            <Link to="/" className="mb-0">
                                <img src="/logo.png" alt="STUDTRADE" className="h-16 w-auto object-contain" />
                            </Link>
                            <h1 className="text-3xl font-extrabold text-primary tracking-tight text-center">Join the community</h1>
                            <p className="text-on-surface-variant mt-2 text-center max-w-xs font-medium">
                                Create your account to start trading with fellow students.
                            </p>
                        </div>

                        {/* Server error */}
                        {serverError && (
                            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-semibold">
                                {serverError}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            {renderField('name', 'Full Name', 'person', 'Alex Johnson')}
                            {renderField('email', 'College Email', 'school', 'alex@university.edu', 'email')}
                            {renderField('phone', 'Phone Number', 'smartphone', '+1 (555) 000-0000', 'tel', true)}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderField('password', 'Password', 'lock', '••••••••', 'password')}
                                {renderField('confirmPassword', 'Confirm Password', 'lock_reset', '••••••••', 'password')}
                            </div>

                            {/* Show passwords */}
                            <div className="flex items-center px-1">
                                <label className="relative flex items-center cursor-pointer group">
                                    <input
                                        className="peer sr-only"
                                        type="checkbox"
                                        checked={showPasswords}
                                        onChange={() => setShowPasswords(v => !v)}
                                    />
                                    <div className="w-5 h-5 bg-surface-container-high rounded-md border-none peer-checked:bg-primary transition-all flex items-center justify-center">
                                        <span className={`material-symbols-outlined text-[16px] text-white transition-opacity ${showPasswords ? 'opacity-100' : 'opacity-0'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                            check
                                        </span>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">
                                        Show passwords
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    className="w-full py-4 bg-primary-container text-on-primary-container font-extrabold text-lg rounded-full shadow-[0_12px_30px_rgba(26,128,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Creating account...
                                        </span>
                                    ) : 'Create Account'}
                                </button>
                            </div>

                            {/* Legal */}
                            <p className="text-[11px] text-center text-outline/70 px-4 leading-relaxed">
                                By signing up, you agree to our <span className="underline hover:text-primary cursor-pointer">Terms of Service</span> and <span className="underline hover:text-primary cursor-pointer">Privacy Policy</span>. We only accept valid university emails.
                            </p>
                        </form>

                        {/* Switch to login */}
                        <div className="mt-12 pt-8 border-t border-surface-container border-dashed text-center">
                            <p className="text-on-surface-variant font-medium">
                                Already have an account?{' '}
                                <Link className="text-primary font-bold hover:underline ml-1" to="/login">Log in</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Support */}
                <div className="mt-8 flex justify-center items-center gap-2 text-outline text-sm font-medium">
                    <span className="material-symbols-outlined text-sm">help_outline</span>
                    <span>Need help with registration?</span>
                    <span className="text-primary-container hover:underline cursor-pointer">Contact Support</span>
                </div>
            </main>
        </div>
    );
}
