//yoyo honey singh 

import React, { Component } from 'react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service here if needed
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            // Clean, minimalist startup-style fallback UI
            return (
                <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
                    <div className="max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center shadow-sm border border-red-200">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Something went wrong</h1>
                            <p className="text-neutral-500 text-sm">
                                We've encountered an unexpected error. Please try refreshing the page or check back later.
                            </p>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white transition-all bg-neutral-900 rounded-full hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Refresh Page
                                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        {/* Optional: Show error message in development mode only (if needed) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100 text-left overflow-auto">
                                <p className="text-xs font-mono text-red-800">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
