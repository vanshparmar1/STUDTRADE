import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// ── Field definitions (drives the input list) ────────────────────────────────
const FIELDS = [
    {
        id: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'Arjun Sharma',
        autoComplete: 'name',
        required: true,
    },
    {
        id: 'email',
        label: 'College Email',
        type: 'email',
        placeholder: 'you@iiitbhopal.ac.in',
        autoComplete: 'email',
        required: true,
        hint: 'Only @iiitbhopal.ac.in addresses are accepted.',
    },
    {
        id: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '9876543210',
        autoComplete: 'tel',
        required: false,
        hint: 'Optional — 10-digit Indian mobile number.',
    },
    {
        id: 'password',
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
        autoComplete: 'new-password',
        required: true,
        hint: 'Minimum 6 characters.',
    },
    {
        id: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        placeholder: '••••••••',
        autoComplete: 'new-password',
        required: true,
    },
];

// ── Client-side validation ───────────────────────────────────────────────────
function validate(form) {
    const errors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters.';
    }
    if (!form.email.toLowerCase().endsWith('@iiitbhopal.ac.in')) {
        errors.email = 'Only @iiitbhopal.ac.in email addresses are allowed.';
    }
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
        errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
    }
    if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
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

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { id, value } = e.target;
        setForm((prev) => ({ ...prev, [id]: value }));
        // Clear that field's error as the user types
        if (fieldErrors[id]) {
            setFieldErrors((prev) => ({ ...prev, [id]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        // 1. Front-end validation
        const errors = validate(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        // 2. API call
        try {
            setLoading(true);
            const { data } = await axios.post('/api/auth/register', {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim() || undefined,
                password: form.password,
            });

            // 3. Hand off to AuthContext — stores token/user and redirects
            login(data.token, data.user, '/');
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Something went wrong. Please try again.';
            setServerError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <main className="flex-grow flex items-center justify-center px-4 py-14 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/60 border border-gray-100 p-8 sm:p-10">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block text-2xl font-black tracking-tighter text-indigo-600 mb-5">
                            STUD<span className="text-gray-900 font-extrabold">TRADE</span>
                        </Link>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Create your account
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Join the exclusive campus marketplace
                        </p>
                    </div>

                    {/* Server-level error banner */}
                    {serverError && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-3.5">
                            <span className="mt-0.5 text-red-500 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </span>
                            <p className="text-sm font-medium text-red-700">{serverError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        {FIELDS.map(({ id, label, type, placeholder, autoComplete, required, hint }) => {
                            // Toggle password visibility for password fields
                            const inputType =
                                (id === 'password' || id === 'confirmPassword') && showPasswords
                                    ? 'text'
                                    : type;

                            return (
                                <div key={id}>
                                    <div className="flex justify-between items-baseline mb-1.5">
                                        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
                                            {label}
                                            {!required && (
                                                <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
                                            )}
                                        </label>
                                        {hint && !fieldErrors[id] && (
                                            <span className="text-xs text-gray-400">{hint}</span>
                                        )}
                                    </div>
                                    <input
                                        id={id}
                                        type={inputType}
                                        value={form[id]}
                                        onChange={handleChange}
                                        placeholder={placeholder}
                                        autoComplete={autoComplete}
                                        required={required}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all
                      ${fieldErrors[id]
                                                ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300'
                                                : 'border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white'
                                            }`}
                                    />
                                    {fieldErrors[id] && (
                                        <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors[id]}</p>
                                    )}
                                </div>
                            );
                        })}

                        {/* Show passwords toggle */}
                        <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                            <input
                                type="checkbox"
                                checked={showPasswords}
                                onChange={() => setShowPasswords((v) => !v)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                            />
                            <span className="text-sm text-gray-500 font-medium">Show passwords</span>
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Creating account…
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Footer link */}
                    <p className="mt-7 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Subtle bottom note */}
                <p className="mt-4 text-center text-xs text-gray-400">
                    By registering, you agree to STUDTRADE's Terms of Service.
                </p>
            </div>
        </main>
    );
}
