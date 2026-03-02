import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-black tracking-tighter text-indigo-600">
                        STUD<span className="text-gray-900 font-extrabold">TRADE</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Marketplace</Link>
                        <a href="#" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Categories</a>
                        <a href="#" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">How it Works</a>
                        {!isAuthPage && (
                            <Link
                                to="/register"
                                className="ml-4 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-indigo-600 hover:shadow-md transition-all"
                            >
                                Join Now
                            </Link>
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
                <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3">
                    <Link to="/" className="block text-sm font-semibold text-gray-700 hover:text-indigo-600 py-1" onClick={() => setMobileOpen(false)}>Marketplace</Link>
                    <a href="#" className="block text-sm font-semibold text-gray-700 hover:text-indigo-600 py-1">Categories</a>
                    <a href="#" className="block text-sm font-semibold text-gray-700 hover:text-indigo-600 py-1">How it Works</a>
                    {!isAuthPage && (
                        <Link
                            to="/register"
                            onClick={() => setMobileOpen(false)}
                            className="block w-full text-center mt-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-indigo-600 transition-all"
                        >
                            Join Now
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
