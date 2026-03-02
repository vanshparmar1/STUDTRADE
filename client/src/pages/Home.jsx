import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/health');
                setHealth(response.data);
                setError(null);
            } catch (err) {
                console.error('API health check failed:', err);
                setError('Server connection failed. Please ensure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        checkHealth();
    }, []);

    return (
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-16 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-6">
                    ✨ Platform is Live
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                    The exclusive marketplace for{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        students.
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed font-medium">
                    Discover, buy, and sell verified items securely within your campus community. Your minimal, safe, and modern trading hub.
                </p>

                {/* Backend Status */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-gray-300 animate-pulse' : error ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        <p className="text-sm font-semibold tracking-tight uppercase text-gray-400">
                            Backend Status:{' '}
                            <span className={loading ? 'text-gray-400' : error ? 'text-red-600' : 'text-emerald-600'}>
                                {loading ? 'Checking...' : error ? error : (health?.message || 'Operational')}
                            </span>
                        </p>
                    </div>
                    {!loading && !error && health?.data && (
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                            Version: {health.data.version || '1.0.0'} | Uptime: {Math.round(health.data.uptime || 0)}s
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                    <Link
                        to="/register"
                        className="px-8 py-3.5 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg hover:shadow-indigo-200 text-center"
                    >
                        Start Trading
                    </Link>
                    <button className="px-8 py-3.5 rounded-full bg-white text-gray-900 border-2 border-gray-200 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                        Browse Categories
                    </button>
                </div>
            </div>
        </main>
    );
}

export default Home;
