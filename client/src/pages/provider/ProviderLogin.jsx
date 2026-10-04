import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LOGO = '/logo.png';

export default function ProviderLogin() {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginInput.trim() || !password) {
      toast.error('Please enter your mobile/email and password');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post('/provider/login', {
        login: loginInput,
        password,
      });

      if (data.success) {
        toast.success(data.message || 'Provider login successful!');
        login(data.token, data.data.user, '/provider/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between p-4 sm:p-6 font-sans">
      
      {/* Header Brand */}
      <div className="max-w-md w-full mx-auto pt-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO} alt="STUDTRADE" className="h-10 w-auto" />
        </Link>
        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-black uppercase tracking-wider">
          PROVIDER PORTAL
        </span>
      </div>

      {/* Main Login Form Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Provider Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage your mess, water camper, rental, or campus shop service.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mobile Number or Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  phone_iphone
                </span>
                <input
                  type="text"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="e.g. 9876543210 or sharmamess@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:bg-white focus:border-amber-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:bg-white focus:border-amber-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast('Please contact admin@studtrade.com to reset your provider password.')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Login to Provider Dashboard</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="relative border-t border-slate-100 pt-6 space-y-4 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Want to list your campus mess, water, or service on STUDTRADE?
            </p>
            
            <Link
              to="/provider/apply"
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs transition-all border border-slate-200/80 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">app_registration</span>
              <span>Apply as Provider</span>
            </Link>
          </div>

        </div>

        {/* Return to Student UI Footer Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors py-2 px-4 rounded-full hover:bg-white/60"
          >
            <span className="material-symbols-outlined text-sm">school</span>
            <span>Are you a student? Return to STUDTRADE</span>
          </Link>
        </div>

      </div>

      <footer className="text-center text-xs font-medium text-slate-400 py-4">
        &copy; {new Date().getFullYear()} STUDTRADE Provider Ecosystem.
      </footer>

    </div>
  );
}
