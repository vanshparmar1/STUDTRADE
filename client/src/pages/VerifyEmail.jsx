import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes

export default function VerifyEmail() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';

    // ── State ──────────────────────────────────────────────────────────────
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [verified, setVerified] = useState(false);

    const inputRefs = useRef([]);

    // ── Redirect if no email ──────────────────────────────────────────────
    useEffect(() => {
        if (!email) navigate('/register', { replace: true });
    }, [email, navigate]);

    // ── OTP expiry countdown ──────────────────────────────────────────────
    useEffect(() => {
        if (secondsLeft <= 0 || verified) {
            setCanResend(true);
            return;
        }
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsLeft, verified]);

    // ── Resend cooldown (30s between resends) ─────────────────────────────
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // ── Format time display ───────────────────────────────────────────────
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    // ── Handle individual digit input ─────────────────────────────────────
    const handleChange = (index, value) => {
        // Only allow single digit
        const digit = value.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits filled
        if (digit && index === OTP_LENGTH - 1) {
            const fullOtp = newOtp.join('');
            if (fullOtp.length === OTP_LENGTH) {
                handleVerify(fullOtp);
            }
        }
    };

    // ── Handle keyboard navigation ────────────────────────────────────────
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // ── Handle paste ──────────────────────────────────────────────────────
    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const newOtp = [...otp];
        for (let i = 0; i < OTP_LENGTH; i++) {
            newOtp[i] = pasted[i] || '';
        }
        setOtp(newOtp);
        setError('');

        // Focus last filled input or the next empty one
        const lastIdx = Math.min(pasted.length, OTP_LENGTH) - 1;
        inputRefs.current[lastIdx]?.focus();

        // Auto-submit if full
        if (pasted.length === OTP_LENGTH) {
            handleVerify(pasted);
        }
    };

    // ── Verify OTP ────────────────────────────────────────────────────────
    const handleVerify = useCallback(async (otpString) => {
        if (loading) return;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await API.post('/auth/verify-email-otp', {
                email,
                otp: otpString,
            });
            setSuccess('Email verified successfully!');
            setVerified(true);

            // Small delay to show success state, then login and redirect
            setTimeout(() => {
                login(data.token, data.user, '/');
            }, 1200);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Verification failed. Please try again.';
            setError(msg);
            // Clear OTP on failure so user can re-enter
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    }, [email, loading, login]);

    // ── Resend OTP ────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (resending || resendCooldown > 0) return;
        setResending(true);
        setError('');
        setSuccess('');

        try {
            await API.post('/auth/resend-email-otp', { email });
            setSuccess('A new OTP has been sent to your email.');
            setSecondsLeft(OTP_EXPIRY_SECONDS);
            setCanResend(false);
            setResendCooldown(30);
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    // ── Manual submit ─────────────────────────────────────────────────────
    const handleManualSubmit = (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length < OTP_LENGTH) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        handleVerify(fullOtp);
    };

    // ── Guard ─────────────────────────────────────────────────────────────
    if (!email) return null;

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6 selection:bg-primary-fixed selection:text-on-primary-fixed">
            {/* Background blurs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 blur-[120px] -z-10 rounded-full" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-primary/5 blur-[100px] -z-10 rounded-full" />

            <main className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col items-center justify-center z-10 relative">
                <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30 flex flex-col">
                    <div className="p-6 sm:p-8 md:p-10 w-full">
                        {/* Brand */}
                        <div className="flex flex-col items-center mb-8">
                            <Link to="/" className="brand-logo-slot brand-logo-slot--mat-white mb-0 inline-flex">
                                <img src="/logo.png" alt="STUDTRADE — Where Students Trade Better" className="h-16 w-auto object-contain" />
                            </Link>
                            <h1 className="text-3xl font-extrabold text-primary tracking-tight text-center mt-2">
                                Verify your email
                            </h1>
                            <p className="text-on-surface-variant mt-3 text-center max-w-xs font-medium leading-relaxed">
                                We've sent a 6-digit code to
                            </p>
                            <p className="text-primary font-bold text-sm mt-1 bg-primary-container/20 px-4 py-1.5 rounded-full">
                                {email}
                            </p>
                        </div>

                        {/* Success message */}
                        {success && (
                            <div className="mb-6 p-4 bg-primary-container/30 text-primary rounded-lg text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    check_circle
                                </span>
                                {success}
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Verified success state */}
                        {verified ? (
                            <div className="flex flex-col items-center py-8 gap-4">
                                <div className="w-20 h-20 rounded-full bg-primary-container/30 flex items-center justify-center animate-bounce">
                                    <span className="material-symbols-outlined text-primary text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        verified
                                    </span>
                                </div>
                                <p className="text-on-surface font-bold text-lg">You're all set!</p>
                                <p className="text-on-surface-variant text-sm font-medium">Redirecting you to the marketplace...</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span className="text-xs text-outline font-medium">Please wait...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* OTP Input */}
                                <form onSubmit={handleManualSubmit} className="space-y-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <label className="text-sm font-semibold text-on-surface-variant">
                                            Enter verification code
                                        </label>
                                        <div className="flex items-center justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
                                            {otp.map((digit, idx) => (
                                                <React.Fragment key={idx}>
                                                    {idx === 3 && (
                                                        <div className="w-2 flex items-center justify-center mx-0.5">
                                                            <div className="w-2 h-0.5 bg-outline-variant rounded-full" />
                                                        </div>
                                                    )}
                                                    <input
                                                        ref={(el) => (inputRefs.current[idx] = el)}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleChange(idx, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                                        disabled={loading || verified}
                                                        className={`
                                                            w-10 h-12 sm:w-12 sm:h-14
                                                            text-center text-lg sm:text-xl font-extrabold
                                                            bg-surface-container-low rounded-xl
                                                            border-2 transition-all duration-200
                                                            focus:ring-0 focus:outline-none shrink-0
                                                            disabled:opacity-50
                                                            ${digit
                                                                ? 'border-primary bg-primary-container/10 text-primary'
                                                                : 'border-transparent hover:border-outline-variant/50'
                                                            }
                                                            ${error ? 'border-error/40 bg-error-container/10' : ''}
                                                            focus:border-primary focus:bg-primary-container/10
                                                        `}
                                                        aria-label={`Digit ${idx + 1}`}
                                                        id={`otp-digit-${idx}`}
                                                    />
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timer */}
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-outline">timer</span>
                                        <span className={`text-sm font-bold ${secondsLeft <= 60 ? 'text-error' : 'text-on-surface-variant'}`}>
                                            {secondsLeft > 0
                                                ? `Code expires in ${formatTime(secondsLeft)}`
                                                : 'Code has expired'
                                            }
                                        </span>
                                    </div>

                                    {/* Verify Button */}
                                    <div className="pt-2">
                                        <button
                                            className="w-full py-4 gradient-primary text-white font-extrabold text-lg rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
                                            type="submit"
                                            disabled={loading || otp.join('').length < OTP_LENGTH}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Verifying…
                                                </span>
                                            ) : 'Verify Email'}
                                        </button>
                                    </div>
                                </form>

                                {/* Resend section */}
                                <div className="mt-8 pt-6 border-t border-surface-container border-dashed">
                                    <div className="flex flex-col items-center gap-3">
                                        <p className="text-sm text-on-surface-variant font-medium">
                                            Didn't receive the code?
                                        </p>
                                        <button
                                            onClick={handleResend}
                                            disabled={resending || resendCooldown > 0 || (!canResend && secondsLeft > 0)}
                                            className="text-primary font-bold text-sm hover:underline decoration-2 underline-offset-4 transition-all disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1.5"
                                        >
                                            {resending ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Sending…
                                                </>
                                            ) : resendCooldown > 0 ? (
                                                `Resend in ${resendCooldown}s`
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                                                    Resend Code
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[11px] text-outline/60 text-center px-6 leading-relaxed mt-1">
                                            Check your spam/junk folder if you don't see the email. The code is valid for 5 minutes.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Back to login */}
                        {!verified && (
                            <div className="mt-8 pt-6 border-t border-surface-container border-dashed text-center">
                                <p className="text-on-surface-variant font-medium">
                                    Wrong email?{' '}
                                    <Link className="text-primary font-bold hover:underline ml-1" to="/register">
                                        Go back
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Support */}
                <div className="mt-8 flex justify-center items-center gap-2 text-outline text-sm font-medium w-full">
                    <span className="material-symbols-outlined text-sm">help_outline</span>
                    <span>Need help?</span>
                    <span className="text-primary hover:underline cursor-pointer font-bold">Contact Support</span>
                </div>
            </main>
        </div>
    );
}
