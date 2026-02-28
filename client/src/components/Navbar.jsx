import React from 'react';

const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center">
                        <a href="/" className="text-2xl font-black tracking-tighter text-indigo-600">
                            STUD<span className="text-gray-900 font-extrabold">TRADE</span>
                        </a>
                    </div>

                    {/* Desktop Navigation links */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <a href="#" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Marketplace</a>
                        <a href="#" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Categories</a>
                        <a href="#" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">How it Works</a>
                        <button className="ml-4 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-indigo-600 hover:shadow-md transition-all">
                            Join Now
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 border border-gray-200 rounded-lg">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
