import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="brand-logo-slot brand-logo-slot--mat-legacy-nav shrink-0 py-1">
                        <img
                            src="/logo.png"
                            alt="STUDTRADE — Where Students Trade Better"
                            className="h-9 sm:h-10 w-auto object-contain object-left"
                        />
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <Link to="/marketplace" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Marketplace</Link>

                        {isAuthenticated ? (
                            <>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all">Admin Panel</Link>
                                )}
                                <Link
                                    to="/sell"
                                    className="text-sm font-bold px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    Sell an Item
                                </Link>
                                <div className="h-4 w-[1px] bg-gray-200 mx-2"></div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/profile"
                                        className="text-right hover:opacity-80 transition-opacity"
                                    >
                                        <p className="text-xs font-black text-gray-900 leading-none">{user?.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{user?.role}</p>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            !isAuthPage && (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-indigo-600">Log In</Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-2.5 rounded-full bg-gray-900 text-white text-sm font-black hover:bg-indigo-600 hover:shadow-lg shadow-gray-200 transition-all active:scale-95"
                                    >
                                        Join Now
                                    </Link>
                                </div>
                            )
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 border border-gray-200 rounded-lg"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-4 py-6 space-y-4 shadow-xl">
                    <Link to="/" className="block text-lg font-bold text-gray-900" onClick={() => setMobileOpen(false)}>Marketplace</Link>

                    {isAuthenticated ? (
                        <>
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="block text-lg font-bold text-indigo-600" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
                            )}
                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="block py-3 text-center rounded-2xl font-bold text-gray-900 bg-gray-50 hover:bg-gray-100"
                                >
                                    My profile
                                </Link>
                                <p className="text-sm font-black text-gray-900 text-center">{user?.name}</p>
                                <button
                                    onClick={() => { logout(); setMobileOpen(false); }}
                                    className="mt-1 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-center"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        !isAuthPage && (
                            <div className="space-y-3">
                                <Link to="/login" className="block w-full py-4 text-center font-bold text-gray-900" onClick={() => setMobileOpen(false)}>Log In</Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="block w-full text-center py-4 rounded-2xl bg-gray-900 text-white font-black shadow-lg"
                                >
                                    Join Now
                                </Link>
                            </div>
                        )
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
