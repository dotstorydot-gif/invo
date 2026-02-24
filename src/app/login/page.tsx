'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loginWithOrg } from '@/lib/auth';
import { Building, User, Lock, ArrowRight, Activity } from 'lucide-react';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEmployee, setIsEmployee] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await loginWithOrg(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // Success will redirect automatically
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Dynamic Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen animate-float"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                        <Activity className="text-accent w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Sign in to your organization workspace</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden">
                        {/* Glossy inner reflection */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4 relative z-10">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Organization ID / Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Building className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        name="org"
                                        required
                                        className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                        placeholder="e.g. Master Admin or Subdomain"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        name="username"
                                        required
                                        className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isEmployee"
                                    name="isEmployee"
                                    value="true"
                                    checked={isEmployee}
                                    onChange={(e) => setIsEmployee(e.target.checked)}
                                    className="w-4 h-4 rounded border-border-custom bg-[#111111] accent-accent"
                                />
                                <label htmlFor="isEmployee" className="text-sm font-bold text-gray-400 cursor-pointer">
                                    I am an Employee (Task Board Access)
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative flex items-center justify-center gap-2 py-3 px-4 bg-accent hover:bg-emerald-500 text-black font-bold rounded-xl transition-all disabled:opacity-50 z-10"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-xs text-gray-600">
                    Secure SaaS Infrastructure • Multi-Tenant Enabled
                </div>
            </motion.div>
        </div>
    );
}
