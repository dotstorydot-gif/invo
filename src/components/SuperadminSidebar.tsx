'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Building2, CreditCard, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SuperadminSidebar() {
    const pathname = usePathname();
    const { logout, session } = useAuth();

    const links = [
        { name: 'Global Dashboard', href: '/superadmin', icon: Shield },
        { name: 'Organizations', href: '/superadmin/organizations', icon: Building2 },
        { name: 'Subscriptions', href: '/superadmin/subscriptions', icon: CreditCard },
        { name: 'Platform Settings', href: '/superadmin/settings', icon: Settings },
    ];

    return (
        <div className="w-72 bg-[#050505] border-r border-white/5 flex flex-col h-screen p-4">
            {/* Brand Header */}
            <div className="flex items-center gap-3 px-4 py-6 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(20,255,140,0.15)]">
                    <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Superadmin</h1>
                    <p className="text-[10px] text-accent uppercase tracking-widest font-semibold mt-0.5">SaaS Control Center</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative group ${isActive
                                    ? 'bg-white/5 text-white border border-white/10'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-gray-500 group-hover:text-accent'} transition-colors duration-300`} />
                            <span className="font-medium text-sm">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Profile / Logout */}
            <div className="mt-auto pt-4 border-t border-white/5">
                <div className="px-4 py-3 mb-2">
                    <p className="text-sm font-semibold text-white truncate">{session?.fullName}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest truncate">{session?.orgName}</p>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    );
}
