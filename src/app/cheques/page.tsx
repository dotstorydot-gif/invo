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
    User,
    Wallet,
    Building,
    ChevronRight,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    Trash2,
    Edit,
    ExternalLink,
    Truck
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface Cheque {
    id: string;
    number: string;
    amount: number;
    type: 'In' | 'Out';
    entity: string; // Customer or Supplier
    purpose: string; // Unit installment, material cost, etc.
    receivedAt: string;
    dueAt: string;
    status: 'Pending' | 'Cleared' | 'Bounced';
}

export default function ChequesPage() {
    const { t } = useLanguage();
    const [cheques, setCheques] = useState<Cheque[]>([
        { id: "CHQ-001", number: "987234", amount: 45000, type: 'In', entity: 'Sameh Kamel', purpose: 'Unit 4B Installment', receivedAt: "2026-02-01", dueAt: "2026-03-15", status: 'Pending' },
        { id: "CHQ-002", number: "112233", amount: 150000, type: 'Out', entity: 'Steel Supply Co.', purpose: 'Raw Materials - Phase 2', receivedAt: "2026-02-10", dueAt: "2026-02-28", status: 'Pending' },
        { id: "CHQ-003", number: "556677", amount: 12000, type: 'In', entity: 'Ahmed Ali', purpose: 'Maintenance Fee', receivedAt: "2026-01-15", dueAt: "2026-01-20", status: 'Cleared' }
    ]);

    const removeCheque = (id: string) => {
        setCheques(cheques.filter(c => c.id !== id));
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('cheques')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('cheque_management')}</p>
                        </div>
                    </div>

                    <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                        <Plus size={20} />
                        <span>Add Cheque</span>
                    </button>
                </header>

                {/* Financial KPIs */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                    <div className="glass p-5 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <ArrowDownLeft size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('inward')}</span>
                        </div>
                        <div className="text-2xl font-bold">570,000 EGP</div>
                        <div className="text-[10px] text-gray-500 mt-1">Pending Clearance</div>
                    </div>

                    <div className="glass p-5 border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-3 text-red-400 mb-2">
                            <ArrowUpRight size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('outward')}</span>
                        </div>
                        <div className="text-2xl font-bold">1.2M EGP</div>
                        <div className="text-[10px] text-gray-500 mt-1">Due next 30 days</div>
                    </div>

                    <div className="glass p-5 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 text-amber-400 mb-2">
                            <Clock size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('maturity_date')}</span>
                        </div>
                        <div className="text-2xl font-bold">12 Cheques</div>
                        <div className="text-[10px] text-gray-500 mt-1">Expiring this month</div>
                    </div>

                    <div className="glass p-5 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                            <TrendingUp size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Net Value</span>
                        </div>
                        <div className="text-2xl font-bold">-630K EGP</div>
                        <div className="text-[10px] text-gray-500 mt-1">Projected balance shift</div>
                    </div>
                </div>

                <div className="glass border-border-custom overflow-hidden">
                    <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                        <div className="glass flex items-center px-4 py-2 gap-3 w-80 border-border-custom bg-background shadow-inner">
                            <Search size={18} className="text-gray-400" />
                            <input type="text" placeholder="Search by cheque #, entity or purpose..." className="bg-transparent border-none outline-none text-sm w-full" />
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 rounded-xl border border-border-custom text-gray-400 text-xs font-bold hover:text-accent transition-all flex items-center gap-2">
                                <Filter size={14} /> Filter
                            </button>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-border-custom">
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500">Cheque Info</th>
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500">{t('entity')} & {t('purpose')}</th>
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500">Dates (Received/Due)</th>
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500">Amount & Status</th>
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cheques.map((chq) => (
                                <motion.tr
                                    layout
                                    key={chq.id}
                                    className="border-b border-border-custom hover:bg-white/5 transition-colors"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${chq.type === 'In' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {chq.type === 'In' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white uppercase tracking-widest text-sm">#{chq.number}</div>
                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{chq.type === 'In' ? t('inward') : t('outward')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-bold text-gray-200 flex items-center gap-2">
                                                {chq.type === 'In' ? <User size={12} className="text-gray-500" /> : <Truck size={12} className="text-emerald-500" />} {chq.entity}
                                            </div>
                                            <div className="text-[10px] text-gray-500 flex items-center gap-2">
                                                <Building size={10} /> {chq.purpose}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar size={12} /> {chq.receivedAt}
                                            </div>
                                            <div className={`flex items-center gap-2 font-bold ${chq.status === 'Pending' ? 'text-amber-400' : 'text-gray-400'}`}>
                                                <Clock size={12} /> {chq.dueAt}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-bold text-accent text-lg">{chq.amount.toLocaleString()} EGP</div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase w-fit ${chq.status === 'Cleared' ? 'bg-emerald-500/10 text-emerald-500' :
                                                chq.status === 'Bounced' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {chq.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => removeCheque(chq.id)}
                                                className="p-2 rounded-lg bg-white/5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-2 rounded-lg bg-white/5 text-accent/60 hover:text-accent hover:bg-accent/10 transition-all">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
