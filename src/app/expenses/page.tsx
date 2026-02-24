"use client";

import React, { useState } from "react";
import {
    BarChart3,
    Plus,
    Search,
    Filter,
    ArrowLeft,
    Zap,
    HardDrive,
    DollarSign,
    TrendingDown,
    Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface ExpenseItem {
    id: string;
    category: string;
    amount: number;
    date: string;
    description: string;
    type: 'Fixed' | 'Variable' | 'Asset';
}

export default function ExpensesPage() {
    const { t } = useLanguage();
    const [expenses] = useState<ExpenseItem[]>([
        { id: "1", category: "Electricity", amount: 2500, date: "2026-02-15", description: "Main branch utility bill", type: 'Fixed' },
        { id: "2", category: "Internet", amount: 800, date: "2026-02-10", description: "Corporate fiber plan", type: 'Fixed' },
        { id: "3", category: "New Server Rack", amount: 45000, date: "2026-02-20", description: "IT infrastructure upgrade", type: 'Asset' },
        { id: "4", category: "Maintenance", amount: 1500, date: "2026-02-22", description: "Generator repair", type: 'Variable' }
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
                            <h2 className="text-3xl font-bold gradient-text">{t('expenses')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('expenses_subtitle')}</p>
                        </div>
                    </div>

                    <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                        <Plus size={20} />
                        <span>Add Expense</span>
                    </button>
                </header>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="glass p-6 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                <Zap size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-400">{t('utilities')}</span>
                        </div>
                        <div className="text-2xl font-bold">3,300 EGP</div>
                        <div className="text-xs text-gray-500 mt-1">Monthly Average</div>
                    </div>

                    <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <HardDrive size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-400">{t('assets')}</span>
                        </div>
                        <div className="text-2xl font-bold">45,000 EGP</div>
                        <div className="text-xs text-gray-500 mt-1">Total Asset Value</div>
                    </div>

                    <div className="glass p-6 border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                <TrendingDown size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-400">Variable Costs</span>
                        </div>
                        <div className="text-2xl font-bold">1,500 EGP</div>
                        <div className="text-xs text-gray-500 mt-1">Last 30 Days</div>
                    </div>
                </div>

                <div className="glass overflow-hidden border-border-custom">
                    <div className="p-6 border-b border-border-custom flex justify-between items-center">
                        <h3 className="font-bold text-xl">{t('latest_transactions')}</h3>
                        <div className="flex items-center gap-3">
                            <div className="glass flex items-center px-4 py-2 gap-3 border-border-custom">
                                <Search size={18} className="text-gray-400" />
                                <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-sm w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="p-4 border-b border-border-custom last:border-0 hover:bg-white/5 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg bg-white/5 ${expense.type === 'Asset' ? 'text-blue-400' : 'text-amber-400'}`}>
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold">{expense.category}</div>
                                        <div className="text-xs text-gray-500">{expense.description}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-sm font-bold">{expense.amount.toLocaleString()} EGP</div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                            <Calendar size={12} />
                                            {expense.date}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${expense.type === 'Asset' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                        {expense.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
