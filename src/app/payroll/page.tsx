"use client";

import React from "react";
import {
    Users,
    Plus,
    ArrowLeft,
    FileText,
    BadgeDollarSign,
    Briefcase,
    History,
    CreditCard,
    ChevronRight,
    Filter,
    ShieldCheck,
    Calculator,
    AlertCircle,
    Activity,
    Search
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";

export default function PayrollPage() {
    const { t } = useLanguage();
    const { data: salaryData, loading } = useERPData<any>('salary_registers');

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('payroll')}</h2>
                            <p className="text-gray-400 text-sm mt-1">Employee Compensation & Contract Management</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="glass flex items-center gap-2 px-4 py-2 border-border-custom text-gray-400 hover:text-accent transition-all">
                            <Calculator size={18} />
                            <span className="text-sm font-bold">Calculate Month</span>
                        </button>
                        <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                            <Plus size={20} />
                            <span>New Contract</span>
                        </button>
                    </div>
                </header>

                {/* Payroll KPIs */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                    <div className="glass p-6 border-accent/20 bg-accent/5">
                        <div className="flex items-center gap-3 text-accent mb-4">
                            <Users size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Active Staff</span>
                        </div>
                        <div className="text-3xl font-bold">128 Employees</div>
                        <div className="text-[10px] text-gray-500 mt-2">All sectors (Sales/Const)</div>
                    </div>

                    <div className="glass p-6 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 text-emerald-400 mb-4">
                            <BadgeDollarSign size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Total Monthly Payroll</span>
                        </div>
                        <div className="text-3xl font-bold">1.45M EGP</div>
                        <div className="text-[10px] text-gray-500 mt-2">Projected for Feb 2026</div>
                    </div>

                    <div className="glass p-6 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 text-amber-400 mb-4">
                            <History size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pending Advances</span>
                        </div>
                        <div className="text-3xl font-bold">18,500 EGP</div>
                        <div className="text-[10px] text-gray-500 mt-2">Deductions scheduled</div>
                    </div>

                    <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 text-blue-400 mb-4">
                            <ShieldCheck size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Compliance</span>
                        </div>
                        <div className="text-3xl font-bold">100%</div>
                        <div className="text-[10px] text-gray-500 mt-2">Regulatory standards met</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Payroll Categories - Matching User Reference (Image 1) */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { label: t('contracts'), icon: Briefcase },
                            { label: t('salary_register'), icon: FileText },
                            { label: t('salary_slips'), icon: CreditCard },
                            { label: t('salary_advances'), icon: BadgeDollarSign },
                            { label: t('salary_items'), icon: Activity },
                            { label: t('salary_templates'), icon: ShieldCheck },
                            { label: t('settings'), icon: Filter }
                        ].map((link, i) => (
                            <button
                                key={i}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-border-custom hover:border-accent/40 bg-white/5 group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon size={18} className="text-gray-500 group-hover:text-accent transition-colors" />
                                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">{link.label}</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-700 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>

                    {/* Payroll Main View */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="glass border-border-custom p-8 bg-white/5">
                            <h3 className="text-xl font-bold mb-8">Monthly Salary Tracking</h3>
                            <div className="space-y-6">
                                {loading ? (
                                    <div className="text-center py-10 text-gray-500 italic">Synchronizing live payroll data...</div>
                                ) : (
                                    salaryData.map((row, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 border border-border-custom rounded-xl hover:bg-white/5 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-bold">
                                                    {row.emp?.[0] || 'E'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{row.emp || 'Employee'}</div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase">{row.role || 'Staff'}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-8 items-center">
                                                {(row.commissions || row.comm) > 0 && (
                                                    <div className="text-right">
                                                        <div className="text-[10px] text-emerald-500 font-bold uppercase">{t('commissions')}</div>
                                                        <div className="text-sm font-bold">{(row.commissions || row.comm).toLocaleString()} EGP</div>
                                                    </div>
                                                )}
                                                <div className="text-right">
                                                    <div className="font-bold text-white">{(row.net_pay || (row.net + row.comm)).toLocaleString()} EGP</div>
                                                    <span className={`text-[10px] font-bold uppercase ${row.status === 'Transferred' ? 'text-emerald-500' : 'text-amber-500'
                                                        }`}>{row.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Loans / Advances Activity */}
                        <div className="glass border-border-custom p-8 bg-white/5">
                            <h3 className="text-xl font-bold mb-6">Recent Loans & Advances</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle size={18} className="text-red-400" />
                                        <span className="text-sm font-bold">Ahmed Ali - Applied for 5,000 EGP advance</span>
                                    </div>
                                    <button className="text-accent text-xs font-bold hover:underline">Review Request</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
