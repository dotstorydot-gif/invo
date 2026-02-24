"use client";

import React, { useState } from "react";
import {
    CreditCard,
    Plus,
    Search,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Percent,
    User,
    Home,
    ChevronRight,
    Filter
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface PaymentPlan {
    id: string;
    name: string;
    interestRate: number;
    installments: number;
    downPayment: number;
}

interface InstallmentRecord {
    id: string;
    unit: string;
    customer: string;
    plan: string;
    totalAmount: number;
    paidAmount: number;
    nextDueAt: string;
    status: 'Collected' | 'Pending' | 'Overdue';
}

export default function InstallmentsPage() {
    const { t } = useLanguage();
    const [plans] = useState<PaymentPlan[]>([
        { id: "PLAN-A", name: "Standard 5 Years", interestRate: 8, installments: 60, downPayment: 15 },
        { id: "PLAN-B", name: "Short Term 2 Years", interestRate: 3.5, installments: 24, downPayment: 25 },
        { id: "PLAN-C", name: "Long Term 10 Years", interestRate: 12, installments: 120, downPayment: 10 }
    ]);

    const [records] = useState<InstallmentRecord[]>([
        { id: "REC-01", unit: "Apt 4B - Sunrise", customer: "Sameh Kamel", plan: "Standard 5 Years", totalAmount: 1500000, paidAmount: 450000, nextDueAt: "2026-03-01", status: "Pending" },
        { id: "REC-02", unit: "Office 12 - Crystal", customer: "Amr Ahmed", plan: "Short Term 2 Years", totalAmount: 2500000, paidAmount: 2500000, nextDueAt: "Completed", status: "Collected" },
        { id: "REC-03", unit: "Apt 2A - Marina", customer: "Nadia Ali", plan: "Long Term 10 Years", totalAmount: 3200000, paidAmount: 85000, nextDueAt: "2026-02-15", status: "Overdue" }
    ]);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('installments')}</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage payment collections and flexible customer financing</p>
                        </div>
                    </div>

                    <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                        <Plus size={20} />
                        <span>New Installment</span>
                    </button>
                </header>

                {/* Analytics & Fast Overview */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                    <div className="glass p-5 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <CheckCircle2 size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('collected')}</span>
                        </div>
                        <div className="text-2xl font-bold">12.4M EGP</div>
                        <div className="text-[10px] text-gray-500 mt-1">This Quarter</div>
                    </div>

                    <div className="glass p-5 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 text-amber-400 mb-2">
                            <Clock size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('due_this_month')}</span>
                        </div>
                        <div className="text-2xl font-bold">4.2M EGP</div>
                        <div className="text-[10px] text-gray-500 mt-1">Expecting 45 collections</div>
                    </div>

                    <div className="glass p-5 border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-3 text-red-400 mb-2">
                            <AlertCircle size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('overdue')}</span>
                        </div>
                        <div className="text-2xl font-bold">850K EGP</div>
                        <div className="text-[10px] text-gray-500 mt-1">8 customers behind schedule</div>
                    </div>

                    <div className="glass p-5 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                            <TrendingUp size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('total_receivable')}</span>
                        </div>
                        <div className="text-2xl font-bold">145M EGP</div>
                        <div className="text-[10px] text-gray-500 mt-1">Outstanding balance total</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Payment Plan Templates */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Percent className="text-accent" size={24} />
                                {t('payment_plans')}
                            </h3>
                            <button className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all">
                                <Plus size={18} />
                            </button>
                        </div>

                        {plans.map((plan) => (
                            <div key={plan.id} className="glass p-5 border-border-custom hover:border-accent/40 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="font-bold text-white mb-1">{plan.name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono tracking-tighter">{plan.id}</div>
                                    </div>
                                    <div className="px-2 py-1 rounded bg-accent/10 text-accent font-bold text-xs uppercase">
                                        {plan.interestRate}% Rate
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-custom">
                                    <div>
                                        <div className="text-[9px] text-gray-500 uppercase font-bold">{t('down_payment')}</div>
                                        <div className="text-sm font-bold text-white">{plan.downPayment}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-gray-500 uppercase font-bold">{t('installments_count')}</div>
                                        <div className="text-sm font-bold text-white">{plan.installments} Months</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Installment Records */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-border-custom">
                            <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                                <Search size={18} className="text-gray-400" />
                                <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-sm w-full" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-custom text-gray-400 hover:text-accent transition-all">
                                <Filter size={18} />
                                <span className="text-sm font-bold">{t('filter')}</span>
                            </button>
                        </div>

                        <div className="glass overflow-hidden border-border-custom">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-border-custom">
                                    <tr>
                                        <th className="p-4 text-[10px] font-bold uppercase text-gray-500">Subject</th>
                                        <th className="p-4 text-[10px] font-bold uppercase text-gray-500">Plan Connection</th>
                                        <th className="p-4 text-[10px] font-bold uppercase text-gray-500">Due Info</th>
                                        <th className="p-4 text-[10px] font-bold uppercase text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((rec) => (
                                        <tr key={rec.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-accent transition-colors">
                                                        <Home size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{rec.unit}</div>
                                                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <User size={10} /> {rec.customer}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs font-bold text-gray-300">{rec.plan}</div>
                                                <div className="text-[10px] text-gray-500 mt-1">Bal: {(rec.totalAmount - rec.paidAmount).toLocaleString()} EGP</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Calendar size={14} className="text-gray-500" />
                                                    {rec.nextDueAt}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${rec.status === 'Collected' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        rec.status === 'Overdue' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-amber-500/10 text-amber-500'
                                                        }`}>
                                                        {rec.status}
                                                    </span>
                                                    <button className="p-1 text-gray-500 hover:text-white transition-colors">
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
