"use client";

import React, { useState } from "react";
import {
    Plus,
    Search,
    ArrowLeft,
    Zap,
    HardDrive,
    DollarSign,
    TrendingDown,
    Calendar,
    MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

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
    const { data: expenses, loading, upsert } = useERPData<ExpenseItem>('expenses');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'Variable' as 'Fixed' | 'Variable' | 'Asset'
    });

    const handleAddExpense = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                category: formData.category,
                amount: Number(formData.amount),
                date: formData.date,
                description: formData.description,
                type: formData.type
            });
            setIsModalOpen(false);
            setFormData({
                category: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                description: '',
                type: 'Variable'
            });
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("Failed to add expense.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalUtilities = expenses
        .filter(e => e.category.toLowerCase().includes('electricity') || e.category.toLowerCase().includes('water') || e.category.toLowerCase().includes('internet'))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalAssets = expenses
        .filter(e => e.type === 'Asset')
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalVariable = expenses
        .filter(e => e.type === 'Variable')
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

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

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
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
                        <div className="text-2xl font-bold">{totalUtilities.toLocaleString()} EGP</div>
                        <div className="text-xs text-gray-500 mt-1">Sum of utility bills</div>
                    </div>

                    <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <HardDrive size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-400">{t('assets')}</span>
                        </div>
                        <div className="text-2xl font-bold">{totalAssets.toLocaleString()} EGP</div>
                        <div className="text-xs text-gray-500 mt-1">Total Asset Investments</div>
                    </div>

                    <div className="glass p-6 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <TrendingDown size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-400">Variable Costs</span>
                        </div>
                        <div className="text-2xl font-bold">{totalVariable.toLocaleString()} EGP</div>
                        <div className="text-xs text-gray-500 mt-1">Operating Expenses</div>
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

                    <div className="flex flex-col min-h-[400px]">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center p-10 italic text-gray-500">Syncing with ledger...</div>
                        ) : expenses.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-gray-500 gap-4 opacity-50">
                                <DollarSign size={40} />
                                <p>No expenses recorded yet.</p>
                            </div>
                        ) : (
                            expenses.map((expense) => (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 border-b border-border-custom last:border-0 hover:bg-white/5 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-white/5 ${expense.type === 'Asset' ? 'text-blue-400' : expense.type === 'Fixed' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold group-hover:text-accent transition-colors">{expense.category}</div>
                                            <div className="text-xs text-gray-500">{expense.description}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-sm font-bold">{(Number(expense.amount) || 0).toLocaleString()} EGP</div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                                <Calendar size={12} />
                                                {expense.date}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${expense.type === 'Asset' ? 'bg-blue-500/10 text-blue-500' : expense.type === 'Fixed' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {expense.type}
                                            </span>
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500 transition-all opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add Expense"
                    onSubmit={handleAddExpense}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount (EGP)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-4 rounded-xl outline-none focus:border-accent transition-all text-xl font-bold"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">Select Category</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Water">Water</option>
                                <option value="Internet">Internet</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Asset">Asset Purchase</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Office Supplies">Office Supplies</option>
                                <option value="Travel">Travel</option>
                                <option value="Taxes">Taxes</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Variable">Variable</option>
                                <option value="Fixed">Fixed</option>
                                <option value="Asset">Asset</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-24 resize-none"
                                placeholder="Details about this expense..."
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
