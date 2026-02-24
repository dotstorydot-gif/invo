"use client";

import React from "react";
import {
    TrendingUp,
    ArrowLeft,
    Calendar,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    Building2,
    Users2,
    Package,
    Cpu,
    Mail,
    Award,
    ShieldCheck,
    RefreshCw,
    Clock,
    History,
    FileText,
    UserCheck,
    Truck
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ReportsPage() {
    const { t } = useLanguage();

    const reportCategories = [
        { id: 'financial', title: t('total_revenue'), icon: TrendingUp, color: "text-emerald-400" },
        { id: 'manufacturing', title: t('reports_manufacturing'), icon: Cpu, color: "text-blue-400" },
        { id: 'cheques', title: t('cheques'), icon: Wallet, color: "text-amber-400" },
        { id: 'sms', title: t('reports_sms'), icon: Mail, color: "text-indigo-400" },
        { id: 'points', title: t('reports_points'), icon: Award, color: "text-yellow-400" },
        { id: 'staff', title: t('staff'), icon: Users2, color: "text-purple-400" },
        { id: 'memberships', title: t('reports_memberships'), icon: ShieldCheck, color: "text-red-400" },
        { id: 'rentals', title: t('rentals'), icon: Building2, color: "text-teal-400" },
        { id: 'workflow', title: t('reports_workflow'), icon: RefreshCw, color: "text-orange-400" },
        { id: 'projects', title: t('projects'), icon: BarChart3, color: "text-cyan-400" },
        { id: 'customers', title: t('customers_count'), icon: UserCheck, color: "text-pink-400" },
        { id: 'inventory', title: t('inventory'), icon: Package, color: "text-emerald-500" },
        { id: 'timetracking', title: t('reports_timetracking'), icon: Clock, color: "text-slate-400" },
        { id: 'activitylog', title: t('reports_activitylog'), icon: History, color: "text-gray-400" }
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Unified Business Intelligence</h2>
                            <p className="text-gray-400 text-sm mt-1">Full spectrum reporting across all operational modules</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass flex items-center px-4 py-2 border-border-custom bg-background/50">
                            <Calendar size={18} className="text-accent mr-2" />
                            <select className="bg-transparent border-none outline-none text-sm font-bold cursor-pointer">
                                <option>Last 30 Days</option>
                                <option>This Quarter</option>
                                <option>Fiscal Year 2026</option>
                            </select>
                        </div>
                        <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                            <FileText size={18} />
                            <span>Full Audit Report</span>
                        </button>
                    </div>
                </header>

                {/* Financial Scoreboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <div className="glass p-8 border-accent/20 bg-accent/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-accent/10 text-accent">
                                <TrendingUp size={24} />
                            </div>
                            <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">+18.5%</div>
                        </div>
                        <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">{t('total_revenue')}</div>
                        <div className="text-4xl font-bold">45,850,000 EGP</div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500">
                            <ArrowUpRight size={12} className="text-emerald-500" />
                            Includes Sales, Installments, & Cleared Cheques
                        </div>
                    </div>

                    <div className="glass p-8 border-red-500/20 bg-red-500/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                                <ArrowUpRight size={24} />
                            </div>
                            <div className="px-2 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-bold">+5.2%</div>
                        </div>
                        <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">{t('total_expenses')}</div>
                        <div className="text-4xl font-bold text-red-400">12,120,500 EGP</div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500">
                            <ArrowUpRight size={12} className="text-red-500" />
                            Includes Staff, Materials, Fixed Costs, & Assets
                        </div>
                    </div>

                    <div className="glass p-8 border-blue-500/20 bg-blue-500/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <Activity size={24} />
                            </div>
                            <div className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold">Health: 92%</div>
                        </div>
                        <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">{t('net_profit')}</div>
                        <div className="text-4xl font-bold text-blue-400">33,729,500 EGP</div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500">
                            <BarChart3 size={12} className="text-blue-400" />
                            Net Margin: 73.5%
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Revenue Breakdown */}
                    <div className="glass border-border-custom p-8 bg-white/5">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <ArrowDownLeft className="text-emerald-500" /> Revenue Stream
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: "Unit Installations", value: 28400000, icon: Building2, color: "text-emerald-400", link: "/installments" },
                                { label: "Cash Sales", value: 12500000, icon: DollarSign, color: "text-blue-400", link: "/invoices" },
                                { label: "Cheque Collections", value: 4950000, icon: Wallet, color: "text-amber-400", link: "/cheques" }
                            ].map((item, i) => (
                                <Link href={item.link} key={i} className="flex justify-between items-center group hover:bg-white/5 p-3 rounded-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-background ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="font-bold text-gray-300 group-hover:text-white">{item.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">{item.value.toLocaleString()} EGP</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right">
                                            {Math.round(item.value / 45850000 * 100)}% of total
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="glass border-border-custom p-8 bg-white/5">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <ArrowUpRight className="text-red-500" /> Expense Allocation
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: "Staff Payroll", value: 4500000, icon: Users2, color: "text-purple-400", link: "/staff" },
                                { label: "Inventory & Materials", value: 5800000, icon: Package, color: "text-red-400", link: "/inventory" },
                                { label: "Sales Commissions", value: 82500, icon: TrendingUp, color: "text-emerald-400", link: "/payroll" },
                                { label: "Supplier Payments", value: 1820500, icon: Truck, color: "text-amber-400", link: "/suppliers" }
                            ].map((item, i) => (
                                <Link href={item.link} key={i} className="flex justify-between items-center group hover:bg-white/5 p-3 rounded-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-background ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="font-bold text-gray-300 group-hover:text-white">{item.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">{item.value.toLocaleString()} EGP</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right">
                                            {Math.round(item.value / 12120500 * 100)}% of cost
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category List & Activity Log Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass border-border-custom p-6 bg-white/5 space-y-4">
                        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-[0.2em] mb-4">Module Reports index</h3>
                        <div className="flex flex-col gap-1 overflow-y-auto max-h-[400px] pr-2 scrollbar-custom">
                            {reportCategories.map((cat) => (
                                <button key={cat.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-all group border border-transparent hover:border-white/10 text-left">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className={`p-2 rounded-lg bg-background ${cat.color} group-hover:scale-110 transition-transform`}>
                                            <cat.icon size={18} />
                                        </div>
                                        <span className="font-bold text-gray-300 group-hover:text-white">{cat.title}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass p-8 border-border-custom bg-white/5">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="font-bold text-xl">Recent Activity Log</h4>
                            <History size={20} className="text-accent" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { msg: "Production Order #55 Completed", time: "2m ago", type: "success" },
                                { msg: "Cheque #987234 Bounced", time: "1h ago", type: "error" },
                                { msg: "Inventory Critical: Cement low", time: "3h ago", type: "warning" },
                                { msg: "New Staff Onboarded: Sameh", time: "5h ago", type: "info" }
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 items-start border-l-2 border-accent/20 pl-4 py-1">
                                    <div>
                                        <div className="text-sm font-bold text-white">{log.msg}</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{log.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Re-using icon from lucide because I already imported it
function ChevronRight({ size, className }: { size: number, className: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

// Fixed Lucide React dependency missing from local context
function DollarSign({ size, className = "" }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}
